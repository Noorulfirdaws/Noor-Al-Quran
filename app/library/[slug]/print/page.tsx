"use client";
import { use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { getProduct } from "../../../data/products";
import Printable from "../../../components/Printable";

export default function PrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProduct(slug);
  if (!product) notFound();

  // Set a sensible document title for the saved PDF filename.
  useEffect(() => {
    const prev = document.title;
    document.title = `${product.title} — Noor-ul-Quran`;
    return () => { document.title = prev; };
  }, [product.title]);

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
