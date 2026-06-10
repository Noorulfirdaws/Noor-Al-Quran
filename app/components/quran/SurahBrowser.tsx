"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, BookOpen, MapPin, Clock, Bookmark } from "lucide-react";
import { getSurahList } from "../../services/quranService";
import { getProgress, getBookmarks } from "../../services/bookmarkService";
import type { SurahMeta, ReadingProgress, Bookmark as BookmarkType } from "../../types/quran";

const JUZZ_MARKERS: Record<number, string> = {
  1: "Juz 1", 2: "Juz 1", 3: "Juz 3", 4: "Juz 4", 5: "Juz 6",
  6: "Juz 7", 7: "Juz 8 & 9", 8: "Juz 9 & 10", 9: "Juz 10 & 11",
  10: "Juz 11", 36: "Juz 22", 67: "Juz 29", 78: "Juz 30",
};

type FilterType = "all" | "meccan" | "medinan";

export default function SurahBrowser() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

  useEffect(() => {
    getSurahList()
      .then(setSurahs)
      .catch(() => {})
      .finally(() => setLoading(false));
    setProgress(getProgress());
    setBookmarks(getBookmarks().slice(0, 3));
  }, []);

  const filtered = surahs.filter((s) => {
    const q = query.toLowerCase();
    const matchesSearch =
      !q ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      String(s.number).startsWith(q);
    const matchesFilter =
      filter === "all" ||
      (filter === "meccan" && s.revelationType === "Meccan") ||
      (filter === "medinan" && s.revelationType === "Medinan");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#050907] text-white">
      {/* Hero header — compact */}
      <div className="bg-gradient-to-b from-[#0d1a12] to-[#050907] px-4 sm:px-6 pt-20 pb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#57d996]/10 text-[#57d996] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#57d996]/20 mb-2">
              <BookOpen size={10} /> QURAN READER
            </span>
            <h1 className="text-xl sm:text-2xl font-black">
              Read the <span className="text-[#57d996]">Holy Quran</span>
            </h1>
          </div>
          <p className="text-white/40 text-xs">
            114 surahs · Arabic · Transliteration · Translation · Audio
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        {/* ── Continue reading + bookmarks ───────────────────────────── */}
        {progress && (
          <Link
            href={`/quran/${progress.surahNumber}`}
            className="flex items-center gap-4 bg-gradient-to-r from-[#57d996]/15 to-[#57d996]/5 border border-[#57d996]/30 hover:border-[#57d996]/60 rounded-2xl px-5 py-4 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#57d996]/25 flex items-center justify-center flex-shrink-0">
              <Clock size={22} className="text-[#57d996]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#57d996]/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">Continue where you left off</div>
              <div className="text-white font-black text-base truncate">{progress.surahName}</div>
              <div className="text-white/40 text-xs mt-0.5">Ayah {progress.ayahNumber} · Last opened {new Date(progress.updatedAt).toLocaleDateString()}</div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-[#57d996] text-xs font-bold group-hover:translate-x-1 transition-transform inline-block">Resume →</div>
              <div className="text-white/20 text-[10px] mt-0.5">Surah {progress.surahNumber}</div>
            </div>
          </Link>
        )}

        {bookmarks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {bookmarks.map((bm) => (
              <Link
                key={`${bm.surahNumber}-${bm.ayahNumber}`}
                href={`/quran/${bm.surahNumber}?ayah=${bm.ayahNumber}`}
                className="flex items-center gap-3 bg-[#f7ca45]/5 border border-[#f7ca45]/15 hover:border-[#f7ca45]/30 rounded-xl px-3 py-3 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f7ca45]/15 flex items-center justify-center flex-shrink-0">
                  <Bookmark size={14} className="text-[#f7ca45]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-xs truncate">{bm.surahName}</div>
                  <div className="text-[#f7ca45]/70 text-[10px]">Ayah {bm.ayahNumber}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Search + filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search surah name or number…"
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#57d996]/40 focus:bg-white/[0.07] transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "meccan", "medinan"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? "bg-[#57d996] text-black"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {f === "all" ? "All 114" : f}
              </button>
            ))}
            <div className="ml-auto text-white/20 text-xs self-center">
              {filtered.length} surah{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Surah grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No surahs match "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <Link
                key={s.number}
                href={`/quran/${s.number}`}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/8 hover:border-[#57d996]/30 hover:bg-[#57d996]/5 rounded-2xl px-4 py-4 transition-all group"
              >
                {/* Number badge */}
                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#57d996]/15 flex items-center justify-center text-xs text-white/40 group-hover:text-[#57d996] font-black transition-all flex-shrink-0 font-mono">
                  {s.number}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-black text-sm group-hover:text-[#57d996] transition-colors">
                      {s.englishName}
                    </span>
                    {s.number === 1 && (
                      <span className="text-[9px] bg-[#57d996]/20 text-[#57d996] px-1.5 py-0.5 rounded-full font-bold">
                        FREE
                      </span>
                    )}
                  </div>
                  <div className="text-white/30 text-[11px] truncate">{s.englishNameTranslation}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/20 text-[10px]">{s.numberOfAyahs} ayahs</span>
                    <span className="text-white/10">·</span>
                    <span className={`text-[10px] ${s.revelationType === "Meccan" ? "text-[#57d996]/40" : "text-[#18c8d8]/40"}`}>
                      {s.revelationType}
                    </span>
                  </div>
                </div>

                {/* Arabic name */}
                <div
                  className="text-white/40 text-lg group-hover:text-white/70 transition-colors flex-shrink-0"
                  style={{ fontFamily: "var(--font-amiri), serif" }}
                >
                  {s.name.replace("سُورَةُ ", "").replace("ال", "").slice(0, 8)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
