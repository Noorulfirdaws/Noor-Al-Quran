"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { surahStrengthMap, memorizationStats, type SurahStrength } from "../../services/revisionService";
import { Grid3x3 } from "lucide-react";

// Whole-Quran memorization heatmap: 114 cells, colored by retention strength.
// Strength decays over time, so this doubles as a "what to revise" map.

const COLOR: Record<SurahStrength, string> = {
  none:   "bg-white/5 hover:bg-white/10 text-white/25",
  weak:   "bg-red-500/70 hover:bg-red-500 text-white",
  review: "bg-yellow-500/70 hover:bg-yellow-500 text-black",
  strong: "bg-green-500/70 hover:bg-green-500 text-black",
};

export default function MemorizationHeatmap() {
  const [map, setMap] = useState<ReturnType<typeof surahStrengthMap>>({});
  const [stats, setStats] = useState({ started: 0, strong: 0, review: 0, weak: 0 });

  useEffect(() => {
    setMap(surahStrengthMap());
    setStats(memorizationStats());
  }, []);

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Grid3x3 size={15} className="text-[#57d996]" />
        <p className="text-white font-bold text-sm">Memorization Map</p>
        <span className="ml-auto text-white/30 text-xs">{stats.started}/114 started</span>
      </div>
      <p className="text-white/35 text-xs mb-4">
        Every surah you&apos;ve recited, colored by how well you&apos;re retaining it right now.
      </p>

      {/* 114-cell grid */}
      <div className="grid grid-cols-12 sm:grid-cols-[repeat(19,minmax(0,1fr))] gap-1">
        {Array.from({ length: 114 }, (_, i) => {
          const n = i + 1;
          const entry = map[n];
          const strength: SurahStrength = entry?.strength ?? "none";
          const cell = (
            <div
              title={entry ? `${entry.name}: ${entry.retention}% retained` : `Surah ${n} — not started`}
              className={`aspect-square rounded-[3px] flex items-center justify-center text-[8px] font-bold transition-all cursor-pointer ${COLOR[strength]}`}
            >
              {n}
            </div>
          );
          return entry ? (
            <Link key={n} href={`/quran/${n}`}>{cell}</Link>
          ) : (
            <Link key={n} href={`/quran/${n}`}>{cell}</Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <Legend color="bg-green-500/70" label={`Strong (${stats.strong})`} />
        <Legend color="bg-yellow-500/70" label={`Review soon (${stats.review})`} />
        <Legend color="bg-red-500/70" label={`At risk (${stats.weak})`} />
        <Legend color="bg-white/5" label="Not started" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-white/40">
      <span className={`w-2.5 h-2.5 rounded-[3px] ${color} inline-block`} /> {label}
    </span>
  );
}
