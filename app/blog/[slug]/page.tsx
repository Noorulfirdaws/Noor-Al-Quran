"use client";
import { useState, use } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { blogPosts, blogPhotos } from "../../data/siteData";
import { ArrowLeft, Clock, User, Sun, Moon } from "lucide-react";
import { useLang } from "../../context/LanguageContext";

function renderContent(content: string, dark: boolean) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="text-xl sm:text-2xl font-black mt-7 mb-2">{line.slice(3)}</h2>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h1 key={i} className="text-2xl sm:text-3xl font-black mt-6 mb-2">{line.slice(2)}</h1>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;

    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={j}>{part.slice(1, -1)}</em>;
      return <span key={j}>{part}</span>;
    });

    if (/^\d+\./.test(line)) {
      return (
        <div key={i} className="flex gap-2.5 mb-1.5">
          <span className="font-bold text-[#57d996] flex-shrink-0 text-sm">{line.match(/^\d+/)![0]}.</span>
          <p className="text-sm sm:text-base leading-relaxed">{rendered}</p>
        </div>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <div key={i} className="flex gap-2.5 mb-1.5">
          <span className="text-[#57d996] flex-shrink-0 mt-0.5 text-sm">•</span>
          <p className="text-sm sm:text-base leading-relaxed">{rendered}</p>
        </div>
      );
    }

    return (
      <p key={i} className="text-sm sm:text-base leading-relaxed">{rendered}</p>
    );
  });
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [dark, setDark] = useState(false);
  const { t } = useLang();
  const post = blogPosts.find((p) => p.slug === slug);
  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">📄</p>
          <h1 className="text-2xl font-black mb-2">Post not found</h1>
          <Link href="/blog" className="text-[#57d996] hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: dark ? "#0d0d0d" : "#ffffff",
        color: dark ? "#e5e5e5" : "#1a1a1a",
      }}
    >
      <Navbar />

      {/* Hero banner — compact, real photo background */}
      <div className={`relative overflow-hidden pt-20 pb-8 px-4 sm:px-6 ${blogPhotos[post.slug] ? "" : `bg-gradient-to-br ${post.gradient}`}`}>
        {blogPhotos[post.slug] && (
          <>
            <img
              src={blogPhotos[post.slug]}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
          </>
        )}
        <div className="relative max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs mb-4 transition-colors">
            <ArrowLeft size={13} /> {t.blogBackToBlog}
          </Link>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.categories.map((c) => (
              <span key={c} className="text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase"
                style={{ backgroundColor: post.accentColor + "30", color: post.accentColor, border: `1px solid ${post.accentColor}50` }}>
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-white/50 text-xs">
            <span className="flex items-center gap-1"><User size={11} /> {post.author}</span>
            <span>·</span>
            <span>{post.updatedAt}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {post.excerpt && (
          <p
            className="text-base sm:text-lg font-semibold leading-relaxed mb-6"
            style={{
              borderLeft: `3px solid ${post.accentColor}`,
              paddingLeft: 16,
              color: dark ? "#d1d5db" : "#374151",
            }}
          >
            {post.excerpt}
          </p>
        )}

        <div className="space-y-1">
          {renderContent(post.content || "", dark)}
        </div>

        {/* CTA card */}
        <div
          className="mt-10 p-6 rounded-2xl text-center"
          style={{
            backgroundColor: dark ? "#1a1a1a" : "#f8f9fa",
            border: `1px solid ${dark ? "#2a2a2a" : "#e5e7eb"}`,
          }}
        >
          <p className="text-[#57d996] text-xs font-bold tracking-widest uppercase mb-1">{t.blogReadyToBegin}</p>
          <h3 className="text-lg font-black mb-3">{t.blogStartMemo}</h3>
          <Link href="/#pricing" className="inline-flex items-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold px-8 py-3 rounded-full text-sm transition-all">
            {t.blogGetStartedFree}
          </Link>
        </div>

        {/* Related posts */}
        <div className="mt-10">
          <h3 className="text-base font-black mb-4">{t.blogMoreFromBlog}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`}
                className="group rounded-2xl overflow-hidden transition-all hover:shadow-md"
                style={{
                  border: `1px solid ${dark ? "#2a2a2a" : "#e5e7eb"}`,
                  backgroundColor: dark ? "#1a1a1a" : "#f8f9fa",
                }}
              >
                <div className={`relative h-24 overflow-hidden ${blogPhotos[r.slug] ? "" : `bg-gradient-to-br ${r.gradient}`}`}>
                  {blogPhotos[r.slug] && (
                    <img
                      src={blogPhotos[r.slug]}
                      alt={r.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">{r.updatedAt}</p>
                  <h4 className="text-sm font-black leading-snug group-hover:text-[#57d996] transition-colors line-clamp-2">
                    {r.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Floating dark/light toggle ── */}
      <button
        onClick={() => setDark(!dark)}
        aria-label="Toggle dark mode"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: dark ? "#f0f0f0" : "#111",
          color: dark ? "#111" : "#fff",
          boxShadow: dark
            ? "0 4px 24px rgba(0,0,0,0.15)"
            : "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
        {dark ? t.blogLightMode : t.blogDarkMode}
      </button>
    </div>
  );
}
