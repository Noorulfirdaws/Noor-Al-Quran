"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { blogPosts, blogPhotos } from "../data/siteData";
import { Clock, User, ArrowRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";

// Static metadata declared separately (must be in a server component to export,
// but keeping the page "use client" means we add a head tag via layout instead)
// export const metadata = { title: "Blog — Noor-ul-Quran", description: "..." };

function PostCard({ post, featured = false }: { post: typeof blogPosts[0]; featured?: boolean }) {
  const photo = blogPhotos[post.slug];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block rounded-3xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 bg-white ${featured ? "sm:col-span-2 lg:col-span-2" : ""}`}
    >
      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden flex items-end p-6 ${featured ? "h-64 sm:h-80" : "h-48"} ${photo ? "" : `bg-gradient-to-br ${post.gradient}`}`}
      >
        {photo ? (
          <>
            {/* Real photo */}
            <img
              src={photo}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark gradient overlay for chip/text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </>
        ) : (
          /* Decorative glow fallback (no photo for this slug) */
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(ellipse at 30% 50%, ${post.accentColor}50, transparent 70%)` }}
          />
        )}
        {/* Category chips */}
        <div className="relative flex flex-wrap gap-2">
          {post.categories.map((c) => (
            <span
              key={c}
              className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase"
              style={{ backgroundColor: post.accentColor + "30", color: post.accentColor, border: `1px solid ${post.accentColor}50` }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1"><User size={11} /> {post.author}</span>
          <span>·</span>
          <span>{post.updatedAt}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
        </div>
        <h2 className={`font-black text-[#050505] leading-snug group-hover:text-[#57d996] transition-colors mb-3 ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-1 mt-4 text-sm font-bold text-[#57d996] opacity-0 group-hover:opacity-100 transition-opacity">
          Read article <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState("All");

  const ALL_CATEGORIES = [
    t.catAll, t.catRamadan, t.catMemorization, t.catTips,
    t.catTajweed, t.catTech, t.catResearch, t.catCommunity,
    t.catAnnouncements, t.catDesign,
  ];

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.categories.includes(activeCategory));

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      {/* Hero */}
      <div className="pt-20 pb-5 px-4 sm:px-6 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[#57d996] text-[10px] font-bold tracking-widest uppercase mb-1">Noor-ul-Quran</p>
            <h1 className="text-2xl sm:text-3xl font-black text-[#050505] leading-none tracking-tight">
              {t.blogTitle}
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-xs">{t.blogSubtitle}</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 min-w-max">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
                style={
                  activeCategory === cat
                    ? { backgroundColor: "#57d996", color: "#000" }
                    : { backgroundColor: "#f4f5f7", color: "#666" }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-gray-500 text-lg">No posts in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured && <PostCard post={featured} featured />}
            {rest.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
