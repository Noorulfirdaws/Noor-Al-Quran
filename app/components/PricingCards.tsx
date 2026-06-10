"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import BillingToggle from "./BillingToggle";
import CheckoutModal from "./CheckoutModal";
import { pricingPlans } from "../data/siteData";

export default function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<null | {
    id: string; name: string; price: number; priceLabel: string; features: string[];
  }>(null);

  return (
    <>
      <section id="pricing" className="bg-[#f4f5f7] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-[#050505] mb-3">Plans</h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-8">
              View our plan information and pick a plan according to your needs.
            </p>
            <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pricingPlans.map((plan) => {
              const price = plan.id === "free" ? 0 : isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const priceLabel =
                plan.id === "free"
                  ? "Free forever"
                  : isAnnual
                  ? plan.annualPriceLabel
                  : plan.monthlyPriceLabel;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 flex flex-col gap-5 transition-all duration-200 ${
                    plan.highlight
                      ? "bg-[#050907] text-white shadow-2xl shadow-black/20 ring-2 ring-[#57d996]/40 scale-[1.02]"
                      : "bg-white text-[#050505] border border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <span className="absolute -top-3 left-6 bg-[#f7ca45] text-black text-xs font-black px-3 py-1 rounded-full tracking-wide">
                      {plan.badge}
                    </span>
                  )}

                  {/* Plan name */}
                  <div>
                    <h3
                      className={`text-xl font-black mb-2 ${
                        plan.highlight ? "text-white" : "text-[#050505]"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        plan.highlight ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className={`h-px ${plan.highlight ? "bg-white/10" : "bg-gray-100"}`} />

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#57d996]/15 flex items-center justify-center">
                          <Check size={11} className="text-[#57d996]" strokeWidth={3} />
                        </span>
                        <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="mt-auto">
                    <div className="flex items-end gap-1 mb-1">
                      {plan.id !== "free" && (
                        <span className="text-sm font-semibold text-gray-400">$</span>
                      )}
                      <span
                        className={`text-4xl font-black ${
                          plan.highlight ? "text-white" : "text-[#050505]"
                        }`}
                      >
                        {plan.id === "free" ? "$0" : price}
                      </span>
                    </div>
                    <p
                      className={`text-xs mb-5 ${
                        plan.highlight ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {priceLabel}
                    </p>

                    <button
                      onClick={() =>
                        setSelectedPlan({
                          id: plan.id,
                          name: plan.name,
                          price,
                          priceLabel: priceLabel ?? "",
                          features: plan.features,
                        })
                      }
                      className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#57d996] focus-visible:outline-none ${
                        plan.highlight
                          ? "bg-[#57d996] hover:bg-[#6ff2a8] text-black shadow-lg shadow-[#57d996]/20"
                          : "border-2 border-[#050907] hover:bg-[#050907] hover:text-white text-[#050505]"
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View all features link */}
          <div className="text-center mt-10">
            <a
              href="#comparison"
              className="inline-flex items-center gap-1.5 text-[#050505] font-semibold text-sm hover:text-[#57d996] transition-colors group"
            >
              View All Features
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Checkout modal */}
      {selectedPlan && (
        <CheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </>
  );
}
