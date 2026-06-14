"use client";
import type { DigitalProduct } from "../data/products";
import { bookContent } from "../data/books";

/**
 * Renders a real, print-ready page for a product's `printable` spec.
 * Light theme, ink-friendly, A4-ish width. Trigger the browser print dialog
 * to save as PDF.
 */
export default function Printable({ product }: { product: DigitalProduct }) {
  const { printable: pr, accent, title, arabicTitle, subtitle } = product;

  const Cell = () => (
    <td className="border border-gray-300 h-9 w-10 text-center align-middle">
      <span className="inline-block w-4 h-4 border border-gray-400 rounded-[3px]" />
    </td>
  );

  return (
    <div className="bg-white text-gray-900 mx-auto max-w-[800px] p-10 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 pb-4 mb-6" style={{ borderColor: accent }}>
        <div>
          {arabicTitle && (
            <p className="text-2xl mb-1" style={{ color: accent, fontFamily: "var(--font-amiri), serif" }}>{arabicTitle}</p>
          )}
          <h1 className="text-2xl font-black">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
        <div className="text-right text-xs text-gray-400">
          <p className="font-bold" style={{ color: accent }}>NOOR-UL-QURAN</p>
          <p>Month / Week: ____________</p>
          <p>Name: ____________</p>
        </div>
      </div>

      {/* ── GRID ── */}
      {pr.kind === "grid" && pr.rows && pr.cols && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 p-2 text-left">&nbsp;</th>
              {pr.cols.map((c) => (
                <th key={c} className="border border-gray-300 bg-gray-50 p-2 font-bold text-center whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pr.rows.map((r) => (
              <tr key={r}>
                <td className="border border-gray-300 p-2 font-semibold whitespace-nowrap" style={{ color: accent }}>{r}</td>
                {pr.cols!.map((c) => <Cell key={c} />)}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── CALENDAR (31 days × prayers) ── */}
      {pr.kind === "calendar" && pr.cols && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 p-1 w-10">Day</th>
              {pr.cols.map((c) => (
                <th key={c} className="border border-gray-300 bg-gray-50 p-1 font-bold text-center">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 31 }, (_, i) => (
              <tr key={i}>
                <td className="border border-gray-300 p-1 text-center font-semibold">{i + 1}</td>
                {pr.cols!.map((c) => (
                  <td key={c} className="border border-gray-300 h-6 text-center">
                    <span className="inline-block w-3 h-3 border border-gray-400 rounded-[2px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── CHECKLIST ── */}
      {pr.kind === "checklist" && pr.items && (
        <ol className="space-y-3">
          {pr.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 border-2 rounded flex-shrink-0" style={{ borderColor: accent }} />
              <span className="text-[15px]">
                <span className="font-bold mr-1" style={{ color: accent }}>{i + 1}.</span>
                {item}
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* ── LOG (column headers + blank rows) ── */}
      {pr.kind === "log" && pr.columns && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {pr.columns.map((c) => (
                <th key={c} className="border border-gray-300 bg-gray-50 p-2 font-bold text-left">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: pr.rowCount ?? 15 }, (_, i) => (
              <tr key={i}>
                {pr.columns!.map((c) => <td key={c} className="border border-gray-300 h-9" />)}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── BOOK (table of contents + full chapter content) ── */}
      {pr.kind === "book" && (() => {
        const chapters = bookContent[product.slug];
        const tocTitles = chapters ? chapters.map((c) => c.title) : (pr.chapters ?? []);
        return (
          <div>
            {/* Table of contents */}
            <h2 className="text-lg font-black mb-4" style={{ color: accent }}>Table of Contents</h2>
            <ol className="space-y-2.5">
              {tocTitles.map((c, i) => (
                <li key={i} className="flex items-baseline gap-2 text-[15px]">
                  <span className="font-bold w-6" style={{ color: accent }}>{i + 1}</span>
                  <span className="flex-1">{c}</span>
                  <span className="flex-1 border-b border-dotted border-gray-300 mx-2" />
                  <span className="text-gray-400 text-xs">p. {i + 2}</span>
                </li>
              ))}
            </ol>

            {/* Full chapters — each starts on a new printed page */}
            {chapters && chapters.map((ch, i) => (
              <article key={i} className="mt-10 break-before-page">
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>
                  Chapter {i + 1}
                </p>
                <h2 className="text-2xl font-black mb-4 border-b pb-2" style={{ borderColor: `${accent}55` }}>
                  {ch.title}
                </h2>
                {ch.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-[15px] leading-7 mb-3 text-gray-800">{para}</p>
                ))}
              </article>
            ))}
          </div>
        );
      })()}

      {pr.note && pr.kind !== "book" && <p className="text-gray-500 text-xs italic mt-6">{pr.note}</p>}

      <p className="text-center text-[10px] text-gray-300 mt-10">
        noor-ul-quran.com — free to print & share for personal use
      </p>
    </div>
  );
}
