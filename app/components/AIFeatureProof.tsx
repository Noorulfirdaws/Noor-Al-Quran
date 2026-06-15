"use client";
import { Mic, CheckCircle2, XCircle, SkipForward, Zap, Trophy, Star, BarChart3 } from "lucide-react";

// Static feature proof section — shows HOW the AI engine works
// with visual mockups to build trust before the pricing section.

const steps = [
  {
    step: "01",
    icon: <Mic size={20} className="text-[#57d996]" />,
    title: "Start Reciting",
    desc: "Tap the mic and recite any ayah aloud. The AI listens in real time using advanced Arabic speech recognition.",
    preview: <MicPreview />,
  },
  {
    step: "02",
    icon: <CheckCircle2 size={20} className="text-[#57d996]" />,
    title: "Instant Word Analysis",
    desc: "Every word is color-coded the moment you say it — green for correct, red for missed, yellow for skipped.",
    preview: <WordPreview />,
  },
  {
    step: "03",
    icon: <Star size={20} className="text-[#57d996]" />,
    title: "AI Coach Feedback",
    desc: "Receive a personal teacher comment after each session — accuracy score, what to fix, and encouragement.",
    preview: <CoachPreview />,
  },
  {
    step: "04",
    icon: <BarChart3 size={20} className="text-[#57d996]" />,
    title: "Track Your Progress",
    desc: "Earn XP, maintain streaks, and watch your accuracy improve session by session on your personal dashboard.",
    preview: <ProgressPreview />,
  },
];

export default function AIFeatureProof() {
  return (
    <section id="features" className="bg-[#050907] py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-[#57d996] text-[11px] font-bold tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Your AI Teacher,<br />
            <span className="text-[#57d996]">Always Watching.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Most Quran apps just show text. Noor-ul-Quran listens to you, detects every mistake, and guides you to perfection.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 hover:border-[#57d996]/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#57d996]/10 border border-[#57d996]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#57d996]/15 transition-all">
                  {s.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#57d996]/60 tracking-widest uppercase">Step {s.step}</span>
                  <h3 className="text-white font-black text-lg">{s.title}</h3>
                </div>
              </div>
              <p className="text-white/45 text-sm leading-relaxed mb-5">{s.desc}</p>
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#070d0a]">
                {s.preview}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom comparison callout */}
        <div className="mt-12 bg-gradient-to-r from-[#57d996]/5 to-[#18c8d8]/5 border border-[#57d996]/15 rounded-3xl p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-white font-black text-xl mb-2">Why not just an audio app?</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Audio apps let you listen. Noor-ul-Quran listens <em>to you</em> — and tells you exactly which word was wrong,
                which was skipped, and how to fix it. That&apos;s the difference between passive listening and active memorization.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Regular Quran app", features: ["Listen to reciters", "Read Arabic text", "Basic bookmarks"] },
                { label: "Noor-ul-Quran AI", features: ["Instant mistake detection", "Word-level accuracy score", "AI coach feedback", "Streak & XP system", "Progress dashboard"] },
              ].map((col, ci) => (
                <div key={ci} className={`rounded-2xl p-4 border ${ci === 1 ? "bg-[#57d996]/8 border-[#57d996]/25" : "bg-white/3 border-white/8"}`}>
                  <p className={`text-xs font-bold mb-2 ${ci === 1 ? "text-[#57d996]" : "text-white/30"}`}>{col.label}</p>
                  {col.features.map((f, fi) => (
                    <p key={fi} className={`text-xs flex items-center gap-1.5 ${ci === 1 ? "text-white/70" : "text-white/25"}`}>
                      {ci === 1 ? "✓" : "·"} {f}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mini mockup previews ─────────────────────────────────────────────────────

function MicPreview() {
  return (
    <div className="p-5 text-center">
      <div className="w-16 h-16 rounded-full bg-[#57d996]/15 border-2 border-[#57d996]/40 flex items-center justify-center mx-auto mb-3 animate-pulse">
        <Mic size={24} className="text-[#57d996]" />
      </div>
      <p className="text-[#57d996] text-xs font-bold mb-1">Listening…</p>
      <p className="text-white/25 text-[10px]" dir="rtl" style={{ fontFamily: "serif" }}>
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
      <div className="flex justify-center gap-1 mt-3">
        {[3,5,8,5,3,7,4,6,3].map((h,i) => (
          <div key={i} className="w-1 rounded-full bg-[#57d996]/50 animate-pulse" style={{ height: h*3, animationDelay: `${i*0.1}s` }} />
        ))}
      </div>
    </div>
  );
}

function WordPreview() {
  const words = [
    { text: "بِسْمِ", status: "correct" },
    { text: "ٱللَّهِ", status: "correct" },
    { text: "ٱلرَّحْمَٰنِ", status: "incorrect" },
    { text: "ٱلرَّحِيمِ", status: "skipped" },
  ];
  const colors: Record<string, string> = {
    correct: "text-green-400 bg-green-400/10",
    incorrect: "text-red-400 bg-red-400/10",
    skipped: "text-yellow-400 bg-yellow-400/10",
  };
  return (
    <div className="p-5">
      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3 text-right">Surah Al-Fatiha · Ayah 1</p>
      <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
        {words.map((w, i) => (
          <span key={i} className={`inline-block px-2 py-1 rounded-lg text-sm font-bold transition-all ${colors[w.status]}`}
            style={{ fontFamily: "serif" }}>
            {w.text}
          </span>
        ))}
      </div>
      <div className="flex gap-3 mt-4 justify-center">
        <span className="flex items-center gap-1 text-[10px] text-green-400"><CheckCircle2 size={10}/> Correct</span>
        <span className="flex items-center gap-1 text-[10px] text-red-400"><XCircle size={10}/> Missed</span>
        <span className="flex items-center gap-1 text-[10px] text-yellow-400"><SkipForward size={10}/> Skipped</span>
      </div>
    </div>
  );
}

function CoachPreview() {
  return (
    <div className="p-5 space-y-3">
      <div className="text-center">
        <div className="text-4xl font-black text-green-400 mb-0.5">87%</div>
        <p className="text-white/30 text-xs">Recitation Accuracy</p>
      </div>
      <div className="bg-[#57d996]/8 border border-[#57d996]/15 rounded-xl p-3 flex items-start gap-2">
        <Star size={12} className="text-[#57d996] flex-shrink-0 mt-0.5" />
        <p className="text-white/55 text-[11px] leading-relaxed">
          Good effort. Focus on the words marked red — repeating them 3 times will anchor them in memory.
        </p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-center">
          <p className="text-orange-400 font-black text-sm">3</p>
          <p className="text-white/25 text-[9px]">missed</p>
        </div>
        <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
          <p className="text-green-400 font-black text-sm">21</p>
          <p className="text-white/25 text-[9px]">correct</p>
        </div>
        <div className="flex-1 bg-[#57d996]/10 border border-[#57d996]/20 rounded-lg p-2 text-center">
          <p className="text-[#57d996] font-black text-sm">+85</p>
          <p className="text-white/25 text-[9px]">XP</p>
        </div>
      </div>
    </div>
  );
}

function ProgressPreview() {
  const bars = [72, 78, 81, 75, 87, 83, 91];
  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
            <span className="text-[10px]">🔥</span>
          </div>
          <span className="text-white/70 text-xs font-bold">7-day streak</span>
        </div>
        <div className="flex items-center gap-1 text-[#57d996]">
          <Zap size={11} />
          <span className="text-xs font-bold">1,240 XP</span>
        </div>
      </div>
      <div>
        <div className="flex items-end gap-1 h-12">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
              height: `${(h/100)*100}%`,
              background: i === bars.length-1 ? "#57d996" : "rgba(87,217,150,0.25)"
            }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {["M","T","W","T","F","S","S"].map((d,i) => (
            <span key={i} className="flex-1 text-center text-[9px] text-white/20">{d}</span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 text-[10px] text-white/30">
        <Trophy size={10} className="text-[#f7ca45]" />
        <span>Achievement: <span className="text-[#f7ca45]">Week Warrior</span> unlocked</span>
      </div>
    </div>
  );
}
