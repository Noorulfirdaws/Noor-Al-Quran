"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Noor-ul-Quran?",
    a: "Noor-ul-Quran is an AI-powered Quran memorization platform. Using artificial intelligence, we equip Muslims worldwide with the tools they need to memorize, recite, and connect with the Quran like never before — with real-time mistake detection, personalized planning, and word-by-word learning.",
  },
  {
    q: "How does the AI recitation detection work?",
    a: "When you recite aloud, our AI listens in real time and compares your recitation to the correct pronunciation word by word. It highlights any errors — mispronounced letters, missing harakat, incorrect tajweed — instantly, so you can correct them before they become habits.",
  },
  {
    q: "Is Noor-ul-Quran free?",
    a: "Yes. The Free plan is free forever with no ads and includes AI Recitation Follow Along, custom goal setting, and streaks. Premium unlocks advanced features including Memorization Mistake Detection, Memorization Planning, Advanced Analytics, and more.",
  },
  {
    q: "What is Noor-ul-Quran Premium?",
    a: "Premium is our full-featured subscription that unlocks everything: real-time mistake detection, a personalized memorization planner, detailed analytics, verse peeking, mistake history and playback, review reminders, and custom schedules. It starts at $5/month billed annually.",
  },
  {
    q: "What is the Family Plan?",
    a: "The Family Plan gives one subscription for up to 5 family members, each with their own account and progress tracking. It is the best-value option for households where multiple people are memorizing — starting at $10/month billed annually.",
  },
  {
    q: "Can I memorize the Quran as an adult?",
    a: "Absolutely. Adults memorize differently than children — not worse, just differently. Adults bring motivation, understanding of meaning, and life experience that actually accelerate retention in many ways. Noor-ul-Quran's planner is specifically designed to fit into a busy adult schedule.",
  },
  {
    q: "What is the word-by-word learning mode?",
    a: "Word-by-word mode breaks each verse into individual words. Tap any word to hear its pronunciation, see its transliteration and English translation, and follow along with highlighted audio playback. It is ideal for learners who want to understand what they are memorizing, not just sound it out.",
  },
  {
    q: "Does Noor-ul-Quran work for children?",
    a: "Yes. The interface is simple and the sessions are short enough for young learners. Many families use Noor-ul-Quran together — parents and children memorizing side by side. The Free plan is a great starting point for children.",
  },
  {
    q: "Which reciters are available for audio?",
    a: "We currently offer five world-renowned reciters: Mishary Rashid Alafasy, Abdurrahmaan As-Sudais, Mohamed El-Minshawi, Mahmoud Khalil Al-Husary, and Abu Bakr Ash-Shaatree. You can switch reciters at any time in the reader settings.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes. There are no lock-in contracts. You can cancel your Premium or Family Plan subscription at any time, and you will retain access until the end of your current billing period. No hidden fees.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. We use 256-bit SSL encryption for all data transmission. We do not sell your personal data to third parties. Your recitation data is used solely to improve your personal learning experience.",
  },
  {
    q: "What languages does Noor-ul-Quran support?",
    a: "The app is available in English, Arabic, and French. The Quran reader includes English translation and transliteration alongside the Uthmanic Arabic script, with more languages planned.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#050907] py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 lg:gap-20 items-start">

          {/* Left — sticky label */}
          <div className="lg:sticky lg:top-24">
            <p className="text-[#57d996] text-xs font-bold tracking-widest uppercase mb-3">Support</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-none mb-4">
              Frequently<br />Asked<br />
              <span className="text-white/20">Questions</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed">
              Can't find what you're looking for?{" "}
              <a href="mailto:support@noor-ul-quran.com" className="text-[#57d996] hover:underline">
                Contact support →
              </a>
            </p>
          </div>

          {/* Right — accordion */}
          <div className="flex flex-col divide-y divide-white/8">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm sm:text-base font-semibold transition-colors duration-200 ${isOpen ? "text-[#57d996]" : "text-white group-hover:text-[#57d996]"}`}>
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 transition-all duration-300 ${isOpen ? "rotate-180 text-[#57d996]" : "text-white/30 group-hover:text-white/60"}`}
                    />
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? 400 : 0 }}
                  >
                    <p className="text-white/60 text-sm leading-relaxed pb-5 pr-8">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
