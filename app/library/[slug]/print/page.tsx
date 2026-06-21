"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, Lock } from "lucide-react";
import { getProduct, productTier } from "../../../data/products";
import Printable from "../../../components/Printable";
import UpgradeModal from "../../../components/UpgradeModal";
import { usePremium } from "../../../context/PremiumContext";

export default function PrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProduct(slug);
  if (!product) notFound();

  const { canAccess } = usePremium();
  const tier = productTier(product);
  const locked = !canAccess(tier);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Set a sensible document title for the saved PDF filename.
  useEffect(() => {
    const prev = document.title;
    document.title = `${product.title} — Noor-ul-Quran`;
    return () => { document.title = prev; };
  }, [product.title]);

  // Guard direct-URL access to restricted printables (client-side gate).
  if (locked) {
    return (
      <div className="min-h-screen bg-[#050907] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#f7ca45]/15 border border-[#f7ca45]/30 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-[#f7ca45]" />
          </div>
          <h1 className="text-xl font-black mb-2">{tier === "family" ? "Family" : "Premium"} content</h1>
          <p className="text-white/50 text-sm mb-5">&ldquo;{product.title}&rdquo; is available on the {tier === "family" ? "Family" : "Premium"} plan.</p>
          <button onClick={() => setShowUpgrade(true)} className="bg-[#f7ca45] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#ffd95e] transition-all">
            Unlock with {tier === "family" ? "Family" : "Premium"}
          </button>
          <div className="mt-3">
            <Link href={`/library/${slug}`} className="text-white/40 hover:text-white text-xs">← Back to product</Link>
          </div>
        </div>
        {showUpgrade && (
          <UpgradeModal requiredTier={tier === "family" ? "family" : "premium"} contentLabel={`"${product.title}"`} onClose={() => setShowUpgrade(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 py-6">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden max-w-[800px] mx-auto px-4 flex items-center justify-between mb-4">
        <Link href={`/library/${slug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-black text-sm">
          <ArrowLeft size={15} /> Back to product
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#050907] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#1a1a1a] transition-all active:scale-95"
        >
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>

      {/* The printable sheet */}
      <div className="shadow-xl print:shadow-none mx-auto max-w-[800px] bg-white">
        <Printable product={product} />
      </div>
    </div>
  );
}
