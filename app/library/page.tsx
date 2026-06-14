"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCover from "../components/BookCover";
import { products, productCategories } from "../data/products";
import { Download, Code2 } from "lucide-react";

export default function LibraryPage() {
  const [cat, setCat] = useState<string>("All");
  const filtered = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-8 px-4 sm:px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-1">Digital Library</p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">The Book Shelf</h1>
          <p className="text-white/50 text-base mt-3 max-w-2xl leading-relaxed">
            Beautifully designed Islamic books and worship trackers — all free to download, print, and use.
            Embed any item on your own site too.
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="sticky top-16 z-30 bg-[#050907]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {productCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                cat === c ? "bg-[#57d996] text-black" : "bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 justify-items-center">
          {filtered.map((p) => (
            <Link key={p.id} href={`/library/${p.slug}`} className="group flex flex-col items-center gap-3 w-44">
              <BookCover
                title={p.title}
                arabicTitle={p.arabicTitle}
                subtitle={p.subtitle}
                gradient={p.gradient}
                accent={p.accent}
                pattern={p.pattern}
              />
              <div className="text-center">
                <p className="text-white text-sm font-bold leading-snug group-hover:text-[#57d996] transition-colors line-clamp-2">{p.title}</p>
                <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-white/35">
                  <span className="inline-flex items-center gap-1"><Download size={9} /> {p.price}</span>
                  <span>·</span>
                  <span>{p.type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Embed promo */}
      <div className="border-t border-white/10 px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <Code2 size={40} className="text-[#57d996] flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-white font-black text-lg">Embed the Book Shelf on your site</h3>
            <p className="text-white/50 text-sm mt-1">
              Add our free Islamic library to any website with a single iframe — masjids, schools, and blogs welcome.
            </p>
          </div>
          <pre className="bg-black/50 border border-white/10 rounded-xl p-3 text-[11px] text-[#57d996] overflow-x-auto max-w-full">
{`<iframe src="https://noor-ul-quran.com/embed/bookshelf"
  width="100%" height="520" style="border:0"
  loading="lazy"></iframe>`}
          </pre>
        </div>
      </div>

      <Footer />
    </div>
  );
}
