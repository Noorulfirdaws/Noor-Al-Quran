"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { useLang } from "../context/LanguageContext";

const BANNER_KEY = "noor:banner-dismissed";
const BANNER_HIDDEN_PATHS = ["/quran", "/demo"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true); // default true to avoid flash
  const { t } = useLang();
  const pathname = usePathname();
  const hideBanner = BANNER_HIDDEN_PATHS.some((p) => pathname?.startsWith(p));

  const navLinks = [
    { label: t.navFeatures, href: "/#features" },
    { label: t.navDemo, href: "/demo" },
    { label: "Quran", href: "/quran" },
    { label: t.navPricing, href: "/#pricing" },
    { label: t.navBlog, href: "/blog" },
  ];

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_KEY) === "1";
    setBannerDismissed(dismissed);
  }, []);

  const dismissBanner = () => {
    localStorage.setItem(BANNER_KEY, "1");
    setBannerDismissed(true);
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement banner — hidden on reader/demo pages and when dismissed */}
      {!bannerDismissed && !hideBanner && (
        <div className="bg-[#57d996] text-black text-xs font-semibold text-center py-2 px-4 flex items-center justify-center gap-2 relative">
          <Sparkles size={13} className="flex-shrink-0" />
          <span>Ramadan Special — 65% off Premium. Limited time.</span>
          <a href="/#pricing" className="underline underline-offset-2 ml-1 hover:text-black/70 transition-colors">
            Claim offer →
          </a>
          <button
            onClick={dismissBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main nav — transparent only on the home page when unscrolled */}
      <div
        className={`transition-all duration-300 ${
          scrolled || pathname !== "/"
            ? "bg-[#070a08]/97 backdrop-blur-md border-b border-[#57d996]/10 shadow-[0_1px_24px_rgba(87,217,150,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <nav className="flex items-center justify-between h-16">

            {/* Logo — crescent + wordmark */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-8 h-8 relative">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Outer ring */}
                  <circle cx="18" cy="18" r="16" stroke="#57d996" strokeWidth="1.5" opacity="0.4" />
                  {/* Crescent shape */}
                  <path
                    d="M18 6 C11.4 6 6 11.4 6 18 C6 24.6 11.4 30 18 30 C14 27 11 22.8 11 18 C11 13.2 14 9 18 6Z"
                    fill="#57d996"
                    opacity="0.9"
                  />
                  {/* Star dot */}
                  <circle cx="24" cy="11" r="2" fill="#f7ca45" opacity="0.95" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-black text-[15px] tracking-[0.15em] group-hover:text-[#57d996] transition-colors duration-200">
                  NOOR-UL-QURAN
                </span>
                <span className="text-[#57d996]/60 text-[8px] tracking-[0.25em] font-medium uppercase mt-0.5">
                  Quran Memorization
                </span>
              </div>
            </Link>

            {/* Desktop centre links */}
            <div className="hidden md:flex items-center">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="relative text-white/70 hover:text-white px-5 py-2 text-sm font-medium transition-colors duration-150 group"
                >
                  {l.label}
                  <span className="absolute bottom-0 left-5 right-5 h-px bg-[#57d996] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </a>
              ))}
            </div>

            {/* Desktop right buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/"
                className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150 px-2"
              >
                {t.navSignIn}
              </a>
              <a
                href="/#pricing"
                className="relative bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold px-5 py-2 rounded-full text-sm transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-[0_0_16px_rgba(87,217,150,0.35)]"
              >
                {t.navStartFree}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden bg-[#070a08]/97 backdrop-blur-md border-t border-[#57d996]/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-white/70 hover:text-white hover:bg-[#57d996]/5 px-3 py-3 rounded-xl text-sm font-medium transition-colors border-l-2 border-transparent hover:border-[#57d996]/40"
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
                <a href="/" className="text-white/70 text-sm font-medium px-4 py-2.5 text-center">
                  {t.navSignIn}
                </a>
                <a
                  href="/#pricing"
                  className="bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold px-4 py-2.5 rounded-full text-sm text-center transition-colors"
                >
                  {t.navStartFree} →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
