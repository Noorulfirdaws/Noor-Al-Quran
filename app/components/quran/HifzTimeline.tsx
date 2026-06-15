"use client";
import { useEffect, useState } from "react";
import { hifzJourney, type Milestone } from "../../services/gamificationService";
import { Route } from "lucide-react";

// Vertical milestone timeline of the user's Hifz journey.

export default function HifzTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => { setMilestones(hifzJourney()); }, []);

  const doneCount = milestones.filter((m) => m.done).length;

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Route size={15} className="text-[#57d996]" />
        <p className="text-white font-bold text-sm">Hifz Journey</p>
        <span className="ml-auto text-white/30 text-xs">{doneCount}/{milestones.length} milestones</span>
      </div>

      <div className="relative pl-2">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          return (
            <div key={i} className="flex gap-3 relative">
              {/* Connector line + node */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 z-10 ${
                  m.done
                    ? "bg-[#57d996]/15 border-[#57d996] grayscale-0"
                    : "bg-white/5 border-white/15 grayscale opacity-50"
                }`}>
                  {m.icon}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 -mt-1 ${m.done ? "bg-[#57d996]/30" : "bg-white/8"}`} style={{ minHeight: 28 }} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 ${m.done ? "" : "opacity-50"}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-bold ${m.done ? "text-white" : "text-white/50"}`}>{m.title}</p>
                  {m.done && m.date && (
                    <span className="text-[10px] text-[#57d996]/70 font-mono">{m.date}</span>
                  )}
                  {!m.done && (
                    <span className="text-[9px] text-white/30 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">upcoming</span>
                  )}
                </div>
                <p className="text-white/35 text-xs mt-0.5">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
