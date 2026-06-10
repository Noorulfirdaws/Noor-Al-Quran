"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";

const blogPosts = [
  {
    id: 1,
    slug: "ramadan-memorization-plan",
    date: "18.02.2026",
    title: "Your 30-Day Ramadan Memorization Plan",
    gradient: "from-black via-slate-900 to-black",
    labelTop: "A series by",
    labelMain: "wahy.",
    labelColor: "#c9a84c",
  },
  {
    id: 2,
    slug: "memorize-quran-as-adult",
    date: "14.02.2026",
    title: "Starting Hifz as an Adult: What Nobody Tells You",
    gradient: "from-emerald-800 via-teal-900 to-slate-900",
    labelTop: "",
    labelMain: "",
    labelColor: "#57d996",
    isPhoto: true,
    photoGradient: "from-teal-600 to-emerald-800",
  },
  {
    id: 3,
    slug: "quran-rendering-digital-age",
    date: "07.01.2026",
    title: "From Page to Screen: Rethinking Quran Rendering for the Digital Age",
    gradient: "from-slate-700 via-slate-800 to-slate-900",
    labelTop: "",
    labelMain: "",
    labelColor: "#18c8d8",
    isPhoto: true,
    photoGradient: "from-cyan-800 to-slate-900",
  },
  {
    id: 4,
    slug: "how-to-memorize-quran",
    date: "12.12.2025",
    title: "How to Memorize The Quran",
    gradient: "from-green-700 via-emerald-800 to-teal-900",
    labelTop: "",
    labelMain: "Q",
    labelColor: "#57d996",
    isPhoto: true,
    photoGradient: "from-green-600 to-emerald-900",
  },
];

export default function BlogSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 360 : -360, behavior: "smooth" });
  };

  return (
    <section id="blog" className="bg-[#f0faf4] py-16 px-4 sm:px-6 overflow-hidden border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black text-[#050505]">Noor-ul-Quran Blog</h2>
          <a href="/blog" className="text-sm font-semibold text-[#57d996] hover:text-[#6ff2a8] transition-colors">{t.blogViewAll}</a>
        </div>
        <div className="h-px bg-gray-200 mb-8" />

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${(post as any).slug}`}
              className="snap-start flex-shrink-0 w-72 sm:w-80 group cursor-pointer"
            >
              {/* Thumbnail */}
              <div
                className="relative rounded-2xl overflow-hidden mb-3 shadow-md"
                style={{ aspectRatio: "16/10" }}
              >
                {/* Background */}
                {post.isPhoto ? (
                  <div className={`absolute inset-0 bg-gradient-to-br ${post.photoGradient}`}>
                    {/* Decorative Quran/book icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <div className="w-16 h-20 border-4 border-white rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">{post.labelMain || "Q"}</span>
                      </div>
                    </div>
                    {/* Children studying silhouettes */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-8 h-10 rounded-t-full bg-black/30" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient}`}>
                    {/* Wahy-style text overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4">
                      {post.labelTop && (
                        <span className="text-white/60 text-[10px] tracking-widest font-light">
                          {post.labelTop}
                        </span>
                      )}
                      {post.labelMain && (
                        <span
                          className="font-black text-5xl italic"
                          style={{ color: post.labelColor, fontFamily: "Georgia, serif" }}
                        >
                          {post.labelMain}
                        </span>
                      )}
                      {/* Small NOOR-UL-QURAN badge */}
                      <span className="text-white/40 text-[8px] tracking-[0.3em] mt-1 uppercase">
                        Noor-ul-Quran
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
              </div>

              {/* Date + title */}
              <p className="text-xs text-gray-400 mb-1.5">{post.date}</p>
              <h3 className="text-sm font-semibold text-[#050505] leading-snug line-clamp-2 group-hover:text-[#57d996] transition-colors">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* Divider + nav buttons */}
        <div className="h-px bg-gray-200 mt-6 mb-5" />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-all active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-all active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
