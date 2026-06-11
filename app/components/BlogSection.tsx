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
    // Ramadan golden lanterns warm glow — Unsplash free
    photo: "https://images.unsplash.com/photo-1577214407836-1f3a0604ecb2?w=640&q=80&fit=crop",
    label: "30-DAY\nPLAN",
  },
  {
    id: 2,
    slug: "memorize-quran-as-adult",
    date: "14.02.2026",
    title: "Starting Hifz as an Adult: What Nobody Tells You",
    // Man reading in library — Unsplash free
    photo: "https://images.unsplash.com/photo-1522211988038-6fcbb8c12c7e?w=640&q=80&fit=crop",
    label: "ADULT\nHIFZ",
  },
  {
    id: 3,
    slug: "quran-rendering-digital-age",
    date: "07.01.2026",
    title: "From Page to Screen: Rethinking Quran Rendering for the Digital Age",
    // Laptop screen digital workspace — Unsplash free
    photo: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=640&q=80&fit=crop",
    label: "DIGITAL\nAGE",
  },
  {
    id: 4,
    slug: "how-to-memorize-quran",
    date: "12.12.2025",
    title: "How to Memorize The Quran",
    // Open Quran book — Unsplash free
    photo: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=640&q=80&fit=crop",
    label: "HOW TO\nMEMORIZE",
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
                {/* Photo */}
                <img
                  src={post.photo}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

                {/* Label — bottom left */}
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-white font-black text-base leading-tight whitespace-pre-line drop-shadow-lg">
                    {post.label}
                  </p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all" />
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
