"use client";
import { useRef, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";

/* ─── iPhone frame ─── */
function IPhone({ children, bg = "#fff" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div className="relative mx-auto flex-shrink-0" style={{ width: 188, height: 340 }}>
      <div
        className="absolute inset-0 rounded-[34px] overflow-hidden"
        style={{
          background: bg,
          border: "5px solid #1a1a1a",
          boxShadow: "0 0 0 1px #333, 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Dynamic island */}
        <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-[64px] h-[20px] bg-black rounded-full z-10" />
        <div className="absolute inset-0 pt-[38px] overflow-hidden">{children}</div>
      </div>
      {/* Side buttons */}
      <div className="absolute -right-[6px] top-[72px] w-[4px] h-[36px] bg-[#1a1a1a] rounded-r-full" />
      <div className="absolute -left-[6px] top-[58px] w-[4px] h-[24px] bg-[#1a1a1a] rounded-l-full" />
      <div className="absolute -left-[6px] top-[92px] w-[4px] h-[40px] bg-[#1a1a1a] rounded-l-full" />
      <div className="absolute -left-[6px] top-[142px] w-[4px] h-[40px] bg-[#1a1a1a] rounded-l-full" />
    </div>
  );
}

/* ─── Screen 1: Mistake Detection ─── */
function MistakeScreen() {
  return (
    <div className="h-full bg-[#f8f5ee] flex flex-col text-black">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100">
        <div className="w-5 h-5 rounded-md bg-gray-100" />
        <div className="text-center">
          <div className="text-[9px] font-black">Al-Fatihah</div>
          <div className="text-[7px] text-gray-400">Verse 1</div>
        </div>
        <div className="w-5 h-5 rounded-md bg-gray-100" />
      </div>
      <div className="flex justify-center py-2 px-3 border-b border-gray-200">
        <div className="bg-white rounded-xl px-3 py-1 border border-gray-200 shadow-sm">
          <div className="text-[13px] font-bold text-gray-700" style={{ fontFamily: "var(--font-amiri), 'Traditional Arabic', 'Arial Unicode MS', serif" }}>بِسۡمِ ٱللَّهِ</div>
        </div>
      </div>
      <div className="flex-1 px-3 py-3">
        <div className="flex flex-wrap justify-end gap-x-1.5 gap-y-1.5 text-right mb-3" dir="rtl">
          {[
            { ar: "بِسْمِ", ok: true },
            { ar: "اللَّهِ", ok: true },
            { ar: "الرَّحْمَـٰنِ", ok: false },
            { ar: "الرَّحِيمِ", ok: true },
          ].map((w, i) => (
            <span key={i} className="text-[13px] font-bold px-1 py-0.5 rounded" style={{ fontFamily: "var(--font-amiri), 'Traditional Arabic', 'Arial Unicode MS', serif", color: w.ok ? "#1a1a1a" : "#ef4444", backgroundColor: w.ok ? "transparent" : "#fee2e2", textDecoration: w.ok ? "none" : "line-through" }}>
              {w.ar}
            </span>
          ))}
        </div>
        <div className="bg-white rounded-xl p-2.5 border border-red-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="text-[9px] font-black text-red-500">Incorrect Word</span>
          </div>
          <div className="flex justify-between text-[8px] mb-0.5">
            <span className="text-gray-400">Expected</span>
            <span className="text-gray-700 font-bold" style={{ fontFamily: "var(--font-amiri), 'Traditional Arabic', 'Arial Unicode MS', serif" }}>الرَّحْمَـٰنِ</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="text-gray-400">Recited</span>
            <span className="text-red-400 font-bold" style={{ fontFamily: "var(--font-amiri), 'Traditional Arabic', 'Arial Unicode MS', serif" }}>الرَّحِيمِ</span>
          </div>
        </div>
      </div>
      <div className="pb-4 flex justify-center">
        <div className="w-11 h-11 rounded-full bg-[#57d996] flex items-center justify-center shadow-lg">
          <div className="w-3 h-5 bg-white rounded-full opacity-90" />
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 2: Planner ─── */
function PlannerScreen() {
  return (
    <div className="h-full bg-white flex flex-col text-black">
      <div className="px-3 pt-3 pb-1.5 border-b border-gray-100">
        <div className="text-[11px] font-black">New Goal</div>
        <div className="text-[8px] text-gray-400">Set Your Intention</div>
      </div>
      <div className="flex-1 px-3 py-2 flex flex-col gap-2.5">
        {[
          { label: "Goal Name", val: "Daily Portion", chip: false, color: "" },
          { label: "Action", val: "memorize", chip: true, color: "#57d996" },
          { label: "Portion", val: "2 pages from", chip: false, color: "" },
          { label: "Range", val: "the Quran", chip: true, color: "#18c8d8" },
          { label: "Schedule", val: "every 1 day", chip: true, color: "#a78bfa" },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[8px] text-gray-400 w-14 shrink-0">{row.label}</span>
            {row.chip ? (
              <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: row.color + "22", color: row.color }}>
                {row.val}
              </span>
            ) : (
              <span className="text-[8px] text-gray-600">{row.val}</span>
            )}
          </div>
        ))}
        <div className="mt-1 border-t border-gray-100 pt-2">
          <div className="text-[8px] text-gray-500 font-bold mb-1.5">Advanced Settings</div>
          <div className="flex justify-between text-[8px]">
            <span className="text-gray-400">Starting Time</span>
          </div>
          <div className="flex justify-between text-[8px] mt-1">
            <span className="text-gray-400">Start</span>
            <span className="text-gray-600">Today, 11:52AM</span>
          </div>
        </div>
      </div>
      <div className="px-3 pb-4">
        <div className="w-full py-1.5 rounded-full bg-[#57d996] text-center text-[9px] font-black text-white">Create Goal</div>
      </div>
    </div>
  );
}

/* ─── Screen 3: Goals ─── */
function GoalsScreen() {
  const goals = [
    { name: "Al-Baqarah", sub: "Juz 1–3", pct: 68, color: "#57d996" },
    { name: "Daily Revision", sub: "1 Juz", pct: 42, color: "#a78bfa" },
    { name: "Juz Amma", sub: "Juz 30", pct: 91, color: "#f97316" },
  ];
  return (
    <div className="h-full bg-[#f8f8f8] flex flex-col text-black">
      <div className="px-3 pt-3 pb-1.5">
        <div className="text-[11px] font-black">My Goals</div>
        <div className="text-[8px] text-gray-400">3 active goals</div>
      </div>
      <div className="flex-1 px-2.5 flex flex-col gap-2">
        {goals.map((g, i) => (
          <div key={i} className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <div className="text-[9px] font-black">{g.name}</div>
                <div className="text-[7px] text-gray-400">{g.sub}</div>
              </div>
              <span className="text-[10px] font-black" style={{ color: g.color }}>{g.pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${g.pct}%`, backgroundColor: g.color }} />
            </div>
          </div>
        ))}
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#57d996]/20 flex items-center justify-center text-[11px] text-[#57d996] font-black">+</div>
          <span className="text-[8px] text-gray-400">Add new goal</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 4: Analytics ─── */
function AnalyticsScreen() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const vals = [35, 55, 42, 75, 62, 90, 50];
  return (
    <div className="h-full bg-white flex flex-col text-black">
      <div className="px-3 pt-3 pb-1">
        <div className="text-[11px] font-black">Analytics</div>
        <div className="text-[8px] text-gray-400">This week</div>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-end gap-1 h-[72px] mb-1">
          {vals.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 5 ? "#57d996" : "#e5e7eb", boxShadow: i === 5 ? "0 0 8px rgba(87,217,150,0.5)" : "none" }} />
              <span className="text-[6px] text-gray-400">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-2.5 flex gap-1.5">
        <div className="flex-1 rounded-xl bg-[#fff8f0] border border-orange-100 p-2 text-center">
          <div className="text-[11px]">🔥</div>
          <div className="text-[10px] font-black">14</div>
          <div className="text-[6px] text-gray-400">Day streak</div>
        </div>
        <div className="flex-1 rounded-xl bg-[#f0fdf8] border border-green-100 p-2 text-center">
          <div className="text-[10px] font-black text-[#57d996]">4.2h</div>
          <div className="text-[6px] text-gray-400">This week</div>
        </div>
        <div className="flex-1 rounded-xl bg-[#f5f0ff] border border-purple-100 p-2 text-center">
          <div className="text-[10px] font-black text-[#a78bfa]">248</div>
          <div className="text-[6px] text-gray-400">Verses</div>
        </div>
      </div>
      <div className="px-3 mt-2">
        <div className="text-[9px] font-black text-gray-600 mb-1.5">Recent Sessions</div>
        {[
          { name: "Al-Baqarah 1–5", time: "9 min", score: "92%" },
          { name: "Juz Amma Review", time: "22 min", score: "87%" },
        ].map((s, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-t border-gray-50">
            <div>
              <div className="text-[8px] font-semibold text-gray-700">{s.name}</div>
              <div className="text-[7px] text-gray-400">{s.time}</div>
            </div>
            <span className="text-[8px] font-black text-[#57d996]">{s.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Cards config ─── */
const CARDS = [
  {
    title: "Mistake Detection",
    desc: "AI listens as you recite and flags missed, incorrect, or skipped words the moment they happen.",
    accent: "#57d996",
    screen: <MistakeScreen />,
  },
  {
    title: "Smart Planning",
    desc: "Build a memorization schedule tailored to your pace, goals, and daily availability.",
    accent: "#18c8d8",
    screen: <PlannerScreen />,
  },
  {
    title: "Goal Tracking",
    desc: "Set clear hifz goals and watch your progress build day by day with visual milestones.",
    accent: "#a78bfa",
    screen: <GoalsScreen />,
  },
  {
    title: "Analytics",
    desc: "See your streak, session time, accuracy trends, and weekly progress in one clear view.",
    accent: "#f97316",
    screen: <AnalyticsScreen />,
  },
];

export default function PremiumFeatures() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    setDragging(true);
    startX.current = e.clientX;
    startScroll.current = scrollRef.current.scrollLeft;
    scrollRef.current.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - startX.current;
    scrollRef.current.scrollLeft = startScroll.current - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    setDragging(false);
  }, []);

  return (
    <section id="features" className="bg-[#f4f5f7] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-[#57d996] text-sm font-bold tracking-widest uppercase mb-2">Premium Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-[#050505] leading-tight">Memorize more</h2>
            <p className="text-gray-500 mt-2 text-base max-w-xs">Make your memorization a Premium experience.</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-3">
            <a href="/#pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#050505] hover:text-[#57d996] transition-colors group">
              See all features <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/#pricing" className="bg-[#050505] hover:bg-[#1a1a1a] text-white font-black px-7 py-3 rounded-full text-sm transition-all active:scale-95">
              GET STARTED
            </a>
          </div>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-6 px-4 sm:px-6 max-w-7xl mx-auto"
        style={{
          scrollbarWidth: "none",
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-3xl overflow-hidden flex flex-col"
            style={{
              width: 272,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#fff",
              pointerEvents: dragging ? "none" : "auto",
            }}
          >
            {/* Text header — strict fixed height so all cards are pixel-equal */}
            <div className="px-6 pt-6 pb-4" style={{ height: 148, overflow: "hidden" }}>
              <h3 className="text-xl font-black text-[#050505] leading-snug mb-2">{card.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
            </div>

            {/* Phone on uniform dark background — fixed height */}
            <div
              className="flex items-end justify-center px-6 pt-8 overflow-hidden"
              style={{
                height: 360,
                background: "#111214",
                position: "relative",
              }}
            >
              {/* Subtle accent glow at top */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full blur-2xl opacity-30 pointer-events-none"
                style={{ backgroundColor: card.accent }}
              />
              <IPhone>{card.screen}</IPhone>
            </div>
          </div>
        ))}
      </div>

      <div className="sm:hidden mt-6 text-center px-4">
        <a href="/#pricing" className="inline-flex items-center justify-center bg-[#050505] text-white font-black px-8 py-3 rounded-full text-sm w-full">
          GET STARTED
        </a>
      </div>
    </section>
  );
}
