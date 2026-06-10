"use client";
import { useState } from "react";
import { MessageCircle, GitBranch, ChevronDown } from "lucide-react";
import { useLang, type Lang } from "../context/LanguageContext";

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.77a4.85 4.85 0 0 1-1.06-.08z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IGIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
function YTIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23 7s-.3-1.9-1.1-2.7c-1.1-1.1-2.3-1.1-2.8-1.2C16.3 3 12 3 12 3s-4.3 0-7.1.1c-.6.1-1.7.1-2.8 1.2C1.3 5.1 1 7 1 7S.7 9.2.7 11.4v2.1c0 2.2.3 4.4.3 4.4s.3 1.9 1.1 2.7c1.1 1.1 2.5 1.1 3.1 1.2C7.2 22 12 22 12 22s4.3 0 7.1-.2c.6-.1 1.7-.1 2.8-1.2.8-.8 1.1-2.7 1.1-2.7s.3-2.2.3-4.4v-2.1C23.3 9.2 23 7 23 7zm-13.5 8.9V8.1l7.5 3.9-7.5 3.9z"/>
    </svg>
  );
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

// columns are built inside the component using t()

export default function Footer() {
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  const columns = [
    {
      heading: t.footerProduct,
      links: [
        { label: t.footerPricing, href: "/#pricing" },
        { label: t.footerGiftCards, href: "/#gift-cards" },
        { label: t.footerFamilyPlan, href: "/#pricing" },
        { label: t.footerPremiumFeatures, href: "/#features" },
      ],
    },
    {
      heading: t.footerCompany,
      links: [
        { label: t.footerBlog, href: "/blog" },
        { label: t.footerCareers, href: "#" },
        { label: t.footerScholarships, href: "#" },
        { label: t.footerSupport, href: "#" },
        { label: t.footerFeatureReq, href: "#" },
      ],
    },
    {
      heading: t.footerCommunity,
      links: [
        { label: t.footerPodcast, href: "/#community" },
        { label: t.footerNetwork, href: "#" },
        { label: t.footerDiscord, href: "#" },
        { label: t.footerRamadan, href: "#" },
      ],
    },
    {
      heading: t.footerLegal,
      links: [
        { label: t.footerPrivacy, href: "#" },
        { label: t.footerTerms, href: "#" },
        { label: t.footerCookies, href: "#" },
      ],
    },
  ];;

  return (
    <footer className="bg-[#050907] border-t border-white/10 pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Top section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-8 h-8">
                <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                  <circle cx="18" cy="18" r="16" stroke="#57d996" strokeWidth="1.5" opacity="0.4" />
                  <path d="M18 6 C11.4 6 6 11.4 6 18 C6 24.6 11.4 30 18 30 C14 27 11 22.8 11 18 C11 13.2 14 9 18 6Z" fill="#57d996" opacity="0.9" />
                  <circle cx="24" cy="11" r="2" fill="#f7ca45" opacity="0.95" />
                </svg>
              </div>
              <div className="leading-none">
                <div className="text-white font-black text-[15px] tracking-[0.15em] group-hover:text-[#57d996] transition-colors">NOOR-UL-QURAN</div>
                <div className="text-[#57d996]/50 text-[8px] tracking-[0.25em] mt-0.5 uppercase">Quran Memorization</div>
              </div>
            </a>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              {t.footerTagline}
            </p>
            {/* Socials */}
            <div className="flex gap-2 flex-wrap">
              {[
                { icon: <IGIcon />, label: "Instagram" },
                { icon: <YTIcon />, label: "YouTube" },
                { icon: <TikTokIcon />, label: "TikTok" },
                { icon: <XIcon />, label: "X" },
                { icon: <MessageCircle size={16} />, label: "Discord" },
                { icon: <GitBranch size={16} />, label: "GitHub" },
              ].map((s) => (
                <a key={s.label} href="#" aria-label={s.label}
                  className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-black text-sm mb-4 tracking-wide">{col.heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-gray-500 hover:text-white text-sm transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs order-2 sm:order-1">
            {t.footerCopyright}
          </p>

          <div className="flex items-center gap-4 order-1 sm:order-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs transition-colors px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
                <ChevronDown size={11} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[130px]">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code as Lang); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left transition-colors hover:bg-white/5 ${lang === l.code ? "text-[#57d996] font-bold" : "text-gray-400"}`}
                    >
                      <span>{l.flag}</span><span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
