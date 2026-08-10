import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { duaSections, duaIntro } from "../data/duas";
import { ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Du'as against Injustice & Oppression — Noor-ul-Quran",
  description:
    "Authentic supplications for times of hardship, fear, and oppression — Arabic, transliteration, and meaning. Fortress of Righteousness.",
};

export default function DuasPage() {
  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-[#57d996] text-[11px] font-bold tracking-[0.2em] uppercase mb-2">
              Fortress of Righteousness
            </p>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              Du&apos;as against <span className="text-[#57d996]">Injustice &amp; Oppression</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base mt-4 leading-relaxed max-w-2xl mx-auto">
              {duaIntro}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {duaSections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="text-[#f7ca45] text-xs font-black tracking-[0.18em] uppercase mb-5 flex items-center gap-2">
                  <span className="h-px flex-1 bg-[#f7ca45]/20" />
                  {section.title}
                  <span className="h-px flex-1 bg-[#f7ca45]/20" />
                </h2>

                <div className="space-y-5">
                  {section.duas.map((dua, i) => (
                    <article
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                    >
                      {/* Arabic */}
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-2xl sm:text-[28px] leading-[2.1] text-white text-right"
                        style={{ fontFamily: "var(--font-amiri), serif" }}
                      >
                        {dua.arabic}
                      </p>

                      {/* Transliteration */}
                      <p className="text-[#57d996]/90 text-sm italic mt-4 leading-relaxed">
                        {dua.transliteration}
                      </p>

                      {/* Meaning */}
                      <p className="text-white/60 text-sm mt-3 leading-relaxed">{dua.meaning}</p>

                      {/* Footer badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {dua.source && (
                          <span className="text-[11px] text-white/40 border border-white/10 rounded-full px-2.5 py-1">
                            {dua.source}
                          </span>
                        )}
                        {dua.repeat && (
                          <span className="text-[11px] font-bold text-[#57d996] bg-[#57d996]/10 border border-[#57d996]/25 rounded-full px-2.5 py-1">
                            {dua.repeat}
                          </span>
                        )}
                        {dua.restored && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f7ca45] bg-[#f7ca45]/10 border border-[#f7ca45]/25 rounded-full px-2.5 py-1">
                            <Sparkles size={11} /> Full text restored
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-14 flex items-start gap-2.5 text-white/40 text-xs border-t border-white/10 pt-6">
            <ShieldCheck size={15} className="text-[#57d996] flex-shrink-0 mt-0.5" />
            <p>
              Keep those in dire situations in your prayers. Supplications are drawn from the Qur&apos;an
              and authentic Sunnah; two du&apos;as whose Arabic had been truncated are restored here in full.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
