"use client";

interface BillingToggleProps {
  isAnnual: boolean;
  onChange: (annual: boolean) => void;
}

export default function BillingToggle({ isAnnual, onChange }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <button
        onClick={() => onChange(false)}
        className={`text-sm font-semibold transition-colors px-2 py-1 ${
          !isAnnual ? "text-[#050505]" : "text-gray-400"
        }`}
      >
        Monthly
      </button>

      <button
        onClick={() => onChange(!isAnnual)}
        className="relative w-14 h-7 rounded-full bg-[#050907] transition-all focus-visible:ring-2 focus-visible:ring-[#57d996] focus-visible:outline-none"
        role="switch"
        aria-checked={isAnnual}
        aria-label="Toggle billing period"
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-[#57d996] shadow transition-all duration-300 ${
            isAnnual ? "left-8" : "left-1"
          }`}
        />
      </button>

      <button
        onClick={() => onChange(true)}
        className={`text-sm font-semibold transition-colors px-2 py-1 ${
          isAnnual ? "text-[#050505]" : "text-gray-400"
        }`}
      >
        Annually
      </button>

      <span className="bg-[#f7ca45] text-black text-xs font-black px-3 py-1 rounded-full tracking-wide">
        UP TO 65% OFF
      </span>
    </div>
  );
}
