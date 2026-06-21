"use client";
import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, FileText, Check, Copy, Code2, Lock } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BookCover from "../../components/BookCover";
import UpgradeModal from "../../components/UpgradeModal";
import { getProduct, products, productTier } from "../../data/products";
import { usePremium } from "../../context/PremiumContext";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProduct(slug);
  if (!product) notFound();

  const { canAccess } = usePremium();
  const tier = productTier(product);
  const locked = !canAccess(tier);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="https://noor-ul-quran.com/embed/bookshelf?slug=${product.slug}" width="320" height="460" style="border:0" loading="lazy"></iframe>`;

  const copy = () => {
    navigator.clipboard?.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 flex-1">
        <div className="max-w-5xl mx-auto">
          <Link href="/library" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs mb-6 transition-colors">
            <ArrowLeft size={13} /> Back to the Book Shelf
          </Link>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Mockup */}
            <div className="flex justify-center md:sticky md:top-24">
              <div className="py-6">
                <BookCover
                  title={product.title}
                  arabicTitle={product.arabicTitle}
                  subtitle={product.subtitle}
                  gradient={product.gradient}
                  accent={product.accent}
                  pattern={product.pattern}
                  size="lg"
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: product.accent }}>
                {product.category} · {product.type}
              </span>
              <h1 className="text-3xl font-black mt-2 leading-tight">{product.title}</h1>
              {product.arabicTitle && (
                <p className="text-xl mt-1" style={{ color: product.accent, fontFamily: "var(--font-amiri), serif" }}>{product.arabicTitle}</p>
              )}
              <p className="text-white/60 mt-4 leading-relaxed">{product.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mt-5 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><FileText size={13} /> {product.pages} {product.pages === 1 ? "page" : "pages"}</span>
                <span>· {product.format}</span>
                <span>· <span className="font-bold" style={{ color: product.accent }}>{product.price}</span></span>
              </div>

              {/* What's inside */}
              <div className="mt-7">
                <h3 className="text-white font-black text-sm mb-3">What&apos;s inside</h3>
                <ul className="space-y-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: product.accent }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tier badge */}
              {tier !== "basic" && (
                <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f7ca45]/10 border border-[#f7ca45]/30 text-[#f7ca45]">
                  <Lock size={11} /> {tier === "family" ? "Family plan" : "Premium"}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                {locked ? (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-full text-sm transition-all active:scale-95 bg-[#f7ca45] text-black hover:bg-[#ffd95e]"
                  >
                    <Lock size={15} /> Unlock with {tier === "family" ? "Family" : "Premium"}
                  </button>
                ) : (
                  <Link
                    href={`/library/${product.slug}/print`}
                    className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-full text-sm transition-all active:scale-95"
                    style={{ backgroundColor: product.accent, color: "#04140c" }}
                  >
                    <Printer size={15} /> {product.type === "Book" ? "Open & download" : "Open printable"}
                  </Link>
                )}
              </div>

              {/* Embed */}
              <div className="mt-9 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 size={15} className="text-[#57d996]" />
                  <h3 className="text-white font-black text-sm">Embed this on your site</h3>
                </div>
                <p className="text-white/40 text-xs mb-3">Paste this anywhere to share the {product.title}.</p>
                <div className="relative">
                  <pre className="bg-black/50 border border-white/10 rounded-xl p-3 pr-12 text-[11px] text-[#57d996] overflow-x-auto whitespace-pre-wrap break-all">{embedCode}</pre>
                  <button onClick={copy} aria-label="Copy embed code"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-all">
                    {copied ? <Check size={14} className="text-[#57d996]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-white/10 pt-10">
              <h2 className="text-white font-black text-lg mb-6">More in {product.category}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                {related.map((r) => (
                  <Link key={r.id} href={`/library/${r.slug}`} className="group flex flex-col items-center gap-3 w-40">
                    <BookCover title={r.title} arabicTitle={r.arabicTitle} subtitle={r.subtitle} gradient={r.gradient} accent={r.accent} pattern={r.pattern} size="sm" />
                    <p className="text-white/80 text-xs font-bold text-center leading-snug group-hover:text-[#57d996] transition-colors line-clamp-2">{r.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showUpgrade && (
        <UpgradeModal
          requiredTier={tier === "family" ? "family" : "premium"}
          contentLabel={`"${product.title}"`}
          onClose={() => setShowUpgrade(false)}
        />
      )}

      <Footer />
    </div>
  );
}
