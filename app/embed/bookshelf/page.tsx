"use client";
import { use } from "react";
import { products, getProduct } from "../../data/products";
import BookCover from "../../components/BookCover";

/**
 * Embeddable Book Shelf widget — no navbar/footer, made to be dropped into an
 * <iframe> on any site. Framing is allowed for /embed/* via next.config headers.
 *
 *   Whole shelf:    /embed/bookshelf
 *   Single product: /embed/bookshelf?slug=daily-salah-tracker
 */
export default function EmbedBookShelf({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = use(searchParams);
  const single = slug ? getProduct(slug) : undefined;
  const base = "https://noor-ul-quran.com";

  // ── Single product card ──
  if (single) {
    return (
      <div className="min-h-screen bg-[#050907] text-white flex items-center justify-center p-5">
        <a href={`${base}/library/${single.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-4 group">
          <BookCover title={single.title} arabicTitle={single.arabicTitle} subtitle={single.subtitle}
            gradient={single.gradient} accent={single.accent} pattern={single.pattern} size="lg" />
          <div className="text-center">
            <p className="font-black text-white group-hover:text-[#57d996] transition-colors">{single.title}</p>
            <p className="text-white/40 text-xs mt-1">{single.price} · {single.type} · Noor-ul-Quran</p>
          </div>
        </a>
      </div>
    );
  }

  // ── Whole shelf ──
  return (
    <div className="min-h-screen bg-[#050907] text-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#57d996] text-[9px] font-bold tracking-widest uppercase">Noor-ul-Quran</p>
          <h2 className="text-lg font-black leading-none">Free Islamic Book Shelf</h2>
        </div>
        <a href={`${base}/library`} target="_blank" rel="noopener noreferrer"
          className="text-[#57d996] text-xs font-bold hover:underline">Browse all →</a>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
        {products.map((p) => (
          <a key={p.id} href={`${base}/library/${p.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex flex-col items-center gap-2 group w-32">
            <BookCover title={p.title} arabicTitle={p.arabicTitle} subtitle={p.subtitle}
              gradient={p.gradient} accent={p.accent} pattern={p.pattern} size="sm" />
            <p className="text-white/80 text-[11px] font-bold text-center leading-tight line-clamp-2 group-hover:text-[#57d996] transition-colors">{p.title}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
