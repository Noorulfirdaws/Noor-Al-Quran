"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Slide data ─── */
const slides = [
  {
    id: 1,
    headline: ["Your Personal", "AI Hifz Teacher."],
    sub: "Listen. Recite. Get instant word-by-word feedback. Memorize faster than ever — available 24/7.",
    cta1: { label: "Start Free Trial", href: "/signup" },
    cta2: { label: "▶ Watch Live Demo", href: "/demo", accent: true },
    // Pexels video: Quran in Close Up #10816965
    videoSrcs: [
      "https://videos.pexels.com/video-files/10816965/10816965-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/10816965/10816965-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/10816965/10816965-sd_960_540_25fps.mp4",
    ],
    fallbackGradient: "from-[#020f07] via-[#041a0c] to-[#020a06]",
    accentColor: "#57d996",
  },
  {
    id: 2,
    headline: ["Instant Mistake", "Detection."],
    sub: "Every word color-coded in real time — green for correct, red for missed. No guessing, no wasted repetition.",
    cta1: { label: "How It Works", href: "/#features" },
    cta2: { label: "Try It Free", href: "/signup", accent: true },
    // Pexels video: Tablet while praying #7953222
    videoSrcs: [
      "https://videos.pexels.com/video-files/7953222/7953222-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/7953222/7953222-sd_960_540_25fps.mp4",
    ],
    fallbackGradient: "from-[#080a1a] via-[#0d1230] to-[#050810]",
    accentColor: "#18c8d8",
  },
  {
    id: 3,
    headline: ["Track Your", "Hifz Journey."],
    sub: "XP, streaks, achievements, and a personal dashboard — stay motivated every single day until you complete your Hifz.",
    cta1: { label: "See Plans", href: "/#pricing" },
    cta2: { label: "▶ Live Demo", href: "/demo", accent: true },
    // Pexels: calm aerial #3214448 (the previous video #6994948 was 403'd by Pexels)
    videoSrcs: [
      "https://videos.pexels.com/video-files/3214448/3214448-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/3214448/3214448-sd_960_540_25fps.mp4",
    ],
    fallbackGradient: "from-[#100a02] via-[#1a1005] to-[#0a0802]",
    accentColor: "#f7ca45",
  },
];

const INTERVAL = 6000;


/* ─── Video background ─── */
function VideoBackground({ slide, active }: { slide: typeof slides[0]; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      // Load if not already loaded
      if (v.readyState === 0) v.load();
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`}>
      {/* Gradient fallback always visible */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.fallbackGradient}`} />

      {/* Video on top of gradient */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        muted
        loop
        playsInline
        preload={active ? "auto" : "none"}
        onCanPlay={(e) => {
          const v = e.target as HTMLVideoElement;
          if (active) v.play().catch(() => {});
        }}
      >
        {slide.videoSrcs.map((src, i) => (
          <source key={i} src={src} type="video/mp4" />
        ))}
      </video>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/20" />
    </div>
  );
}

/* ─── Main Hero ─── */
export default function HeroPricing() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [textVisible, setTextVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setTextVisible(false);
    setTimeout(() => {
      setPrev(current);
      setCurrent(idx);
      setTextVisible(true);
    }, 400);
  };

  const next = () => goTo((current + 1) % slides.length);
  const back = () => goTo((current - 1 + slides.length) % slides.length);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(next, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current]);

  const slide = slides[current];

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-black">

      {/* Video backgrounds — all rendered, only active one is visible */}
      {slides.map((s, i) => (
        <VideoBackground key={s.id} slide={s} active={i === current} />
      ))}

      {/* Hero text */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-16 pb-16 sm:pb-20 lg:pb-28 max-w-4xl">
        <div className="h-24" />

        {/* Animated headline */}
        <div
          className="transition-all duration-500"
          style={{ opacity: textVisible ? 1 : 0, transform: textVisible ? "translateY(0)" : "translateY(20px)" }}
        >
          <h1 className="text-[clamp(3.5rem,9vw,7.5rem)] font-black text-white leading-[0.92] tracking-tight mb-5">
            {slide.headline[0]}<br />
            <span style={{ color: slide.accentColor }}>{slide.headline[1]}</span>
          </h1>

          {/* Accent underline */}
          <div
            className="w-48 sm:w-64 h-1 rounded-full mb-7 transition-all duration-700"
            style={{ backgroundColor: slide.accentColor }}
          />

          <p className="text-gray-300 text-lg sm:text-xl max-w-md mb-10 leading-relaxed">
            {slide.sub}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={slide.cta1.href}
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-black font-bold px-8 py-4 rounded-full text-base transition-all active:scale-95"
            >
              {slide.cta1.label}
            </a>
            <a
              href={slide.cta2.href}
              className="inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-full text-base transition-all active:scale-95"
              style={{
                backgroundColor: slide.accentColor,
                color: "#000",
                boxShadow: `0 0 24px ${slide.accentColor}55`,
              }}
            >
              {slide.cta2.label}
            </a>
          </div>

          {/* Trust micro-proof */}
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-white/45 text-xs">
              <span style={{ color: slide.accentColor }}>✓</span> Real-time AI feedback
            </div>
            <div className="flex items-center gap-1.5 text-white/45 text-xs">
              <span style={{ color: slide.accentColor }}>✓</span> Word-by-word detection
            </div>
            <div className="flex items-center gap-1.5 text-white/45 text-xs">
              <span style={{ color: slide.accentColor }}>✓</span> No credit card needed
            </div>
          </div>

          {/* App store badges */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <a href="#" aria-label="Download on the App Store" className="group">
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm rounded-xl px-4 py-2.5 transition-all">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 flex-shrink-0">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="leading-none">
                  <div className="text-white/60 text-[9px] font-medium">Download on the</div>
                  <div className="text-white font-bold text-[13px]">App Store</div>
                </div>
              </div>
            </a>
            <a href="#" aria-label="Get it on Google Play" className="group">
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm rounded-xl px-4 py-2.5 transition-all">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 flex-shrink-0">
                  <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" opacity=".6"/>
                  <path d="M3 20.5l8.16-8.5L3 3.5v17z" fill="none"/>
                  <path d="M3.18 3.22l9.04 9.28-9.04 9.28A1.08 1.08 0 013 20.5v-17c0-.36.18-.67.18-.28z" opacity=".4"/>
                  <path d="M3.18 20.78l9.04-9.28 3.07 3.15-10.54 6.39a1.1 1.1 0 01-1.57-.26z" opacity=".8"/>
                  <path d="M3.18 3.22l10.54 6.39-3.07 3.15-7.47-9.54z" opacity=".6"/>
                </svg>
                <div className="leading-none">
                  <div className="text-white/60 text-[9px] font-medium">Get it on</div>
                  <div className="text-white font-bold text-[13px]">Google Play</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Slide controls — bottom right */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
        <button
          onClick={back}
          className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                backgroundColor: i === current ? slide.accentColor : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-10 left-6 sm:left-10 lg:left-16 z-20">
        <span className="text-white font-black text-sm" style={{ color: slide.accentColor }}>
          0{current + 1}
        </span>
        <span className="text-white/30 text-sm"> / 0{slides.length}</span>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <div
          className="h-full transition-none"
          style={{ backgroundColor: slide.accentColor, width: `${((current + 1) / slides.length) * 100}%`, transition: "width 0.4s ease" }}
        />
      </div>
    </section>
  );
}
