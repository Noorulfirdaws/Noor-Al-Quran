"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Download } from "lucide-react";
import { products } from "../data/products";
import BookCover from "./BookCover";

export default function BookShelf() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 420 : -420, behavior: "smooth" });
  };

  return (
    <section id="library" className="bg-[#050907] py-20 px-4 sm:px-6 overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-2 gap-4 flex-wrap">
          <div>
            <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-1">Digital Library</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-none">The Book Shelf</h2>
          </div>
          <Link href="/library" className="text-sm font-semibold text-[#57d996] hover:text-[#6ff2a8] transition-colors flex items-center gap-1">
            Browse all <ArrowRight size={14} />
          </Link>
        </div>
        <p className="text-white/40 text-sm max-w-xl mb-8">
          Beautifully designed Islamic books and worship trackers — free to download, print, and use every day.
        </p>

        {/* Shelf */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/library/${p.slug}`}
                className="snap-start flex-shrink-0 group flex flex-col items-center gap-3"
              >
                <BookCover
                  title={p.title}
                  arabicTitle={p.arabicTitle}
                  subtitle={p.subtitle}
                  gradient={p.gradient}
                  accent={p.accent}
                  pattern={p.pattern}
                />
                <div className="text-center w-40">
                  <p className="text-white text-xs font-bold leading-snug line-clamp-2 group-hover:text-[#57d996] transition-colors">{p.title}</p>
                  <p className="text-white/30 text-[10px] mt-0.5 inline-flex items-center gap-1">
                    <Download size={9} /> {p.price} · {p.type}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Wooden shelf edge */}
          <div className="h-2 rounded-full bg-gradient-to-b from-[#3a2a1a] to-[#1c140c] shadow-[0_6px_18px_-4px_rgba(0,0,0,0.8)] -mt-3" />
        </div>

        {/* Nav buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => scroll("left")} aria-label="Previous"
            className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-[#57d996] transition-all active:scale-95">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")} aria-label="Next"
            className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-[#57d996] transition-all active:scale-95">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
