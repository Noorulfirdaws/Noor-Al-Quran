"use client";
import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const YOUTUBE_ID = "_943K51Z_2E";

const reviews = [
  {
    name: "Sheikh Samih Jad",
    country: "🕌 Quran Scholar",
    avatar: "SJ",
    color: "#57d996",
    text: "This application makes you a far better learner. The AI listens to every word you recite and corrects you instantly — exactly like a private teacher available at any hour. Anyone serious about Hifz should use it.",
    stars: 5,
  },
  {
    name: "Fatima R.",
    country: "🇺🇸 USA",
    avatar: "FR",
    color: "#18c8d8",
    text: "Using Noor-ul-Quran made me a more disciplined and consistent learner. The goal planning shows you exactly what to revise each day. I went from 1 juz a week to 3. No other app comes close.",
    stars: 5,
  },
  {
    name: "Yusuf M.",
    country: "🇸🇦 KSA",
    avatar: "YM",
    color: "#f7ca45",
    text: "The real-time mistake detection is unlike anything else. It catches every tajweed error instantly. My teacher noticed how much faster I was progressing after just two weeks of using this app.",
    stars: 5,
  },
  {
    name: "Maryam T.",
    country: "🇨🇦 Canada",
    avatar: "MT",
    color: "#a78bfa",
    text: "As a working mother of 3 I never thought I could complete my Hifz. The 15-minute daily plans fit into my schedule perfectly. Noor-ul-Quran turned an impossible dream into a daily reality. JazakAllah khair.",
    stars: 5,
  },
];

export default function SocialProof() {
  const [playing, setPlaying] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  const prev = () => setReviewIdx((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setReviewIdx((i) => (i + 1) % reviews.length);

  const r = reviews[reviewIdx];

  return (
    <section className="bg-[#050907] py-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Top label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-[#57d996] text-[#57d996]" />
            ))}
          </div>
          <span className="text-[#57d996] text-sm font-bold">100,000+ five-star reviews</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-16 max-w-3xl">
          What&apos;s the{" "}
          <span className="italic text-[#57d996]">big</span> deal with
          Noor-ul-Quran{" "}
          <span className="italic">Premium</span> anyway?
        </h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — review card */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative min-h-[240px] flex flex-col justify-between">
              <Quote size={32} className="text-[#57d996]/40 mb-4" />
              <p className="text-white/90 text-lg leading-relaxed font-medium flex-1">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-black flex-shrink-0"
                  style={{ backgroundColor: r.color }}
                >
                  {r.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{r.name}</p>
                  <p className="text-white/40 text-xs">{r.country}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(r.stars)].map((_, i) => (
                    <Star key={i} size={13} className="fill-[#57d996] text-[#57d996]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Prev / Next + dots */}
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
              <div className="flex gap-1.5 ml-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewIdx(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: i === reviewIdx ? 20 : 6,
                      height: 6,
                      backgroundColor: i === reviewIdx ? "#57d996" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>

              <a
                href="#pricing"
                className="ml-auto inline-flex items-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold px-5 py-2.5 rounded-full text-sm transition-all active:scale-95"
              >
                See Plans →
              </a>
            </div>
          </div>

          {/* Right — YouTube video */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/60 cursor-pointer group"
            style={{ aspectRatio: "16/9" }}
          >
            {!playing ? (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full"
                aria-label="Play video"
              >
                {/* Gradient fallback background (shows when thumbnail can't load) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b1a] via-[#0a1f2e] to-[#050907]" />

                {/* YouTube thumbnail on top */}
                <img
                  src={`https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
                  alt="Watch video"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-all" />

                {/* Centre content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#57d996] flex items-center justify-center shadow-2xl shadow-[#57d996]/50 group-hover:scale-110 transition-transform">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Corner badge */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <div className="w-3.5 h-3.5">
                    <svg viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="14" stroke="#57d996" strokeWidth="1.5" opacity="0.4" />
                      <path d="M16 4 C10 4 5 9 5 16 C5 23 10 28 16 28 C12 25 9 20 9 16 C9 12 12 7 16 4Z" fill="#57d996" opacity="0.9" />
                      <circle cx="22" cy="8" r="2" fill="#f7ca45" />
                    </svg>
                  </div>
                  <span className="text-white text-[10px] font-black tracking-wider">NOOR-UL-QURAN</span>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-white text-xs font-bold">3:42</span>
                </div>
              </button>
            ) : (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
                title="The Amazing Benefits of Quran for Rizq and Wellbeing | Sheikh Samih Jad"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
