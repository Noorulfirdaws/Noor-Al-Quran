"use client";
import { useState } from "react";
import { Minus, Plus, Gift, X } from "lucide-react";
import { giftCards } from "../data/siteData";
import CheckoutModal from "./CheckoutModal";

function QuantityStepper({ qty, onMinus, onPlus }: { qty: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onMinus} disabled={qty <= 1} aria-label="Decrease quantity"
        className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#57d996] hover:text-[#57d996] disabled:opacity-30 transition-all active:scale-95">
        <Minus size={13} strokeWidth={3} />
      </button>
      <span className="w-6 text-center font-bold text-[#050505] text-sm">{qty}</span>
      <button onClick={onPlus} aria-label="Increase quantity"
        className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#57d996] hover:text-[#57d996] transition-all active:scale-95">
        <Plus size={13} strokeWidth={3} />
      </button>
    </div>
  );
}

function GiftCardVisual() {
  return (
    <div className="relative w-56 h-36">
      <div className="absolute top-4 left-4 w-full h-full rounded-2xl bg-gradient-to-br from-[#18c8d8]/40 to-[#57d996]/20 border border-[#57d996]/20 backdrop-blur-sm" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0d2b1a] via-[#0a1f17] to-[#071a1f] border border-[#57d996]/30 shadow-xl p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <polygon points="16,2 24,14 16,12" fill="#57d996" opacity="0.9" />
              <polygon points="16,2 8,14 16,12" fill="#6ff2a8" opacity="0.7" />
              <polygon points="16,12 24,14 16,30" fill="#18c8d8" opacity="0.85" />
              <polygon points="16,12 8,14 16,30" fill="#57d996" opacity="0.6" />
            </svg>
          </div>
          <span className="text-white text-xs font-black tracking-widest">NOOR-UL-QURAN</span>
        </div>
        <div>
          <p className="text-[#57d996] text-[10px] font-black tracking-widest mb-0.5">FAMILY PLAN</p>
          <div className="flex gap-2 items-center">
            <span className="text-white/60 text-[9px] font-semibold">5 ACCOUNTS</span>
            <span className="text-white/30 text-[9px]">·</span>
            <span className="text-white/60 text-[9px] font-semibold">12 Months</span>
          </div>
          <p className="text-white/40 text-[9px] mt-1 tracking-widest">GIFT CARD</p>
        </div>
      </div>
    </div>
  );
}

function RedeemModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) { setError("Please enter a valid gift card code."); return; }
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-[#050907] px-6 pt-6 pb-5">
          <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-[#57d996]/15 flex items-center justify-center mb-3">
            <Gift size={22} className="text-[#57d996]" />
          </div>
          <h2 className="text-white text-xl font-black">Redeem Gift Card</h2>
          <p className="text-white/40 text-sm mt-1">Enter your code to unlock Premium access</p>
        </div>
        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#57d996] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#57d996]/30">
                <Gift size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-black text-[#050505] mb-1">Gift card redeemed!</h3>
              <p className="text-gray-500 text-sm mb-5">Premium access has been activated on your account.</p>
              <button onClick={onClose} className="bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold px-8 py-3 rounded-full text-sm transition-all">
                Start memorizing →
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Gift card code</label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                  maxLength={20}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[#57d996]/40 tracking-widest font-mono ${error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#57d996]"}`}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <button type="submit"
                className="w-full bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-2xl text-sm transition-all active:scale-[0.98]">
                Redeem
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GiftCards() {
  const [quantities, setQuantities] = useState<Record<number, number>>(
    Object.fromEntries(giftCards.map((g) => [g.id, 1]))
  );
  const [checkoutCard, setCheckoutCard] = useState<{ id: number; duration: string; price: number } | null>(null);
  const [showRedeem, setShowRedeem] = useState(false);

  const update = (id: number, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  return (
    <section id="gift-cards" className="bg-[#f4f5f7] py-20 px-4">
      {/* Hero */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="rounded-3xl bg-gradient-to-br from-[#050907] via-[#0d2b1a] to-[#071a1f] p-10 sm:p-14 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[#57d996] text-sm font-semibold tracking-widest mb-4">GIFT CARDS</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Give the gift of<br />
              <span className="text-[#57d996]">Noor-ul-Quran Premium</span><br />
              to your loved ones
            </h2>
            <p className="text-gray-400 text-lg max-w-md">
              They memorize more Quran. You get the rewards. Talk about a win-win!
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center">
            <GiftCardVisual />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-2xl font-black text-[#050505] mb-6">Choose a gift</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {giftCards.map((card) => {
            const qty = quantities[card.id] || 1;
            const total = (card.price * qty).toFixed(2);
            return (
              <div key={card.id}
                className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-[#57d996]/30 hover:shadow-md transition-all flex flex-col gap-4">
                <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-[#0d2b1a] to-[#071a1f] flex items-center justify-center border border-[#57d996]/20">
                  <div className="text-center">
                    <p className="text-[#57d996] text-xs font-black tracking-widest">{card.duration}</p>
                    <p className="text-white/40 text-[9px] tracking-widest mt-1">PREMIUM GIFT CARD</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-[#050505] text-base mb-1">{card.duration}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{card.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#050505]">${total}</span>
                  <QuantityStepper qty={qty} onMinus={() => update(card.id, -1)} onPlus={() => update(card.id, 1)} />
                </div>
                <button
                  onClick={() => setCheckoutCard({ id: card.id, duration: card.duration, price: parseFloat(total) })}
                  className="w-full py-3 rounded-full border-2 border-[#050907] text-[#050505] font-bold text-sm hover:bg-[#050907] hover:text-white transition-all active:scale-95">
                  BUY GIFT CARD
                </button>
              </div>
            );
          })}

          {/* Redeem card */}
          <div className="bg-[#050907] rounded-3xl p-6 flex flex-col gap-4 items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#57d996]/15 flex items-center justify-center">
              <Gift size={26} className="text-[#57d996]" />
            </div>
            <div>
              <h4 className="font-black text-white text-base mb-1">Received a Gift Card?</h4>
              <p className="text-gray-500 text-xs">Enter your code to unlock Premium access.</p>
            </div>
            <button
              onClick={() => setShowRedeem(true)}
              className="w-full py-3 rounded-full bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold text-sm transition-all active:scale-95 shadow-lg shadow-[#57d996]/20">
              REDEEM GIFT CARD
            </button>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {checkoutCard && (
        <CheckoutModal
          plan={{
            id: "gift",
            name: `${checkoutCard.duration} Gift Card`,
            price: checkoutCard.price,
            priceLabel: "one-time payment",
            features: [
              `${checkoutCard.duration} of Noor-ul-Quran Premium`,
              "Memorization Mistake Detection",
              "Memorization Planning & Analytics",
              "Delivered instantly by email",
            ],
          }}
          onClose={() => setCheckoutCard(null)}
        />
      )}

      {/* Redeem modal */}
      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}
    </section>
  );
}
