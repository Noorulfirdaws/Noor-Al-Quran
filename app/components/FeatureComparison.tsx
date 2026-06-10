import { Check, X } from "lucide-react";
import { comparisonFeatures } from "../data/siteData";

function Tick() {
  return (
    <div className="flex justify-center">
      <span className="w-7 h-7 rounded-full bg-[#57d996] flex items-center justify-center shadow-[0_0_12px_rgba(87,217,150,0.4)]">
        <Check size={14} className="text-black" strokeWidth={3.5} />
      </span>
    </div>
  );
}

function Cross() {
  return (
    <div className="flex justify-center">
      <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
        <X size={12} className="text-gray-300" strokeWidth={3} />
      </span>
    </div>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Tick />;
  if (value === false) return <Cross />;
  return <div className="text-center text-sm font-black text-[#050505]">{value as string}</div>;
}

export default function FeatureComparison() {
  return (
    <section id="comparison" className="bg-[#f4f5f7] py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#57d996] text-sm font-black tracking-widest uppercase mb-3">Plans</p>
          <h2 className="text-5xl sm:text-6xl font-black text-[#050505] leading-none tracking-tight mb-4">
            Free vs Premium
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            Every feature. Side by side. No surprises.
          </p>
        </div>

        {/* Table card */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200">

          {/* Sticky column headers */}
          <div className="grid grid-cols-3 bg-[#050907]">
            <div className="px-6 py-5 text-gray-400 text-sm font-black tracking-wide uppercase">Feature</div>
            <div className="px-4 py-5 text-center">
              <span className="text-gray-400 text-sm font-black tracking-wide uppercase">Free</span>
            </div>
            <div className="px-4 py-5 text-center bg-[#57d996]/10">
              <span className="text-[#57d996] text-sm font-black tracking-wide uppercase">Premium</span>
              <div className="text-[10px] text-[#57d996]/60 font-semibold mt-0.5">$5 / month</div>
            </div>
          </div>

          {/* Sections */}
          {comparisonFeatures.map((section, si) => (
            <div key={si}>
              {/* Section label */}
              <div className="bg-[#f0f0f0] border-t border-gray-200 px-6 py-3 flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-[#57d996]" />
                <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
                  {section.section}
                </span>
              </div>

              {/* Rows */}
              {section.rows.map((row, ri) => (
                <div
                  key={ri}
                  className={`grid grid-cols-3 border-t border-gray-100 transition-colors hover:bg-[#f9fafb] ${ri % 2 === 1 ? "bg-white" : "bg-white"}`}
                >
                  <div className="px-6 py-4 flex items-center">
                    <span className="text-[#050505] font-bold text-sm">{row.feature}</span>
                  </div>
                  <div className="px-4 py-4 flex items-center justify-center">
                    <Cell value={row.free} />
                  </div>
                  <div className="px-4 py-4 flex items-center justify-center bg-[#57d996]/4">
                    <Cell value={row.premium} />
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer row */}
          <div className="grid grid-cols-3 border-t border-gray-200 bg-[#050907]">
            <div className="px-6 py-5" />
            <div className="px-4 py-5 flex justify-center">
              <a href="/#pricing"
                className="bg-white/10 hover:bg-white/20 text-white font-black px-5 py-2 rounded-full text-sm transition-all active:scale-95">
                Free
              </a>
            </div>
            <div className="px-4 py-5 flex justify-center bg-[#57d996]/10">
              <a href="/#pricing"
                className="bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black px-5 py-2 rounded-full text-sm transition-all active:scale-95 shadow-[0_0_16px_rgba(87,217,150,0.4)]">
                Get Premium
              </a>
            </div>
          </div>
        </div>

        {/* Sub-copy */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Cancel anytime · No commitments · Available on iOS & Android
        </p>
      </div>
    </section>
  );
}
