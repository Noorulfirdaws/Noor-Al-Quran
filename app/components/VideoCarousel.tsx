"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

const podcastEpisodes = [
  {
    id: 1,
    date: "01.10.2025",
    title: "The REAL Reason You Struggle With The Quran | Qari Yahya Ali | re:Verses Episode 52 Part 2",
    label: "BEYOND\nMEMORIZATION",
    // Man reading Arabic book — Unsplash free
    photo: "https://images.unsplash.com/photo-1573483883644-d0b4b55eb25d?w=640&q=80&fit=crop",
    youtubeId: "rAKLiE3opKU",
  },
  {
    id: 2,
    date: "21.09.2025",
    title: "I Wanted to Quit the Quran... Then Allah Showed Me This | Qari Yahya Ali | re:Verses Episode 52 Part 1",
    label: "NEVER\nGIVE UP",
    // Intricate Arabic calligraphy mosque dome — Unsplash free
    photo: "https://images.unsplash.com/photo-1761639935382-43452f278898?w=640&q=80&fit=crop",
    youtubeId: "rAKLiE3opKU",
  },
  {
    id: 3,
    date: "25.07.2025",
    title: "Quran Revision Burnout? Try This 20-Minute Protocol | Qari Younus Rahman | re:Verses Episode 51",
    label: "1 JUZ IN\n20\nMINUTES?!",
    // Person at desk studying under lamp at night — Unsplash free
    photo: "https://images.unsplash.com/photo-1639300505533-9921527d6a50?w=640&q=80&fit=crop",
    youtubeId: "rAKLiE3opKU",
  },
  {
    id: 4,
    date: "15.06.2025",
    title: "The Science of Memorization: What Brain Research Tells Us About Hifz | re:Verses Episode 50",
    label: "SCIENCE\nOF\nHIFZ",
    // Iridescent glowing brain science render — Unsplash free
    photo: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=640&q=80&fit=crop",
    youtubeId: "rAKLiE3opKU",
  },
  {
    id: 5,
    date: "03.05.2025",
    title: "From Zero to Hafiz at 40: One Man's Journey | re:Verses Episode 49",
    label: "HAFIZ\nAT 40",
    // Man reading in library — Unsplash free
    photo: "https://images.unsplash.com/photo-1573142143200-2a6d95ae7352?w=640&q=80&fit=crop",
    youtubeId: "rAKLiE3opKU",
  },
];

export default function VideoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 360 : -360, behavior: "smooth" });
  };

  return (
    <>
      <section id="community" className="bg-[#f0faf4] py-16 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-black text-[#050505]">re:Verses podcast</h2>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">View All</a>
          </div>
          <div className="h-px bg-gray-200 mb-8" />

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {podcastEpisodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setActiveVideo({ id: ep.youtubeId, title: ep.title })}
                className="snap-start flex-shrink-0 w-72 sm:w-80 group cursor-pointer text-left"
              >
                {/* Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden mb-3 shadow-md" style={{ aspectRatio: "16/10" }}>
                  {/* Background photo */}
                  <img
                    src={ep.photo}
                    alt={ep.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                  {/* Label text — bottom left */}
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-white font-black text-lg leading-tight whitespace-pre-line drop-shadow-lg">
                      {ep.label}
                    </p>
                  </div>

                  {/* Play button — centre */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-[#57d996] group-hover:border-[#57d996] group-hover:scale-110 transition-all duration-200 shadow-lg">
                      <Play size={18} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Date + title */}
                <p className="text-xs text-gray-400 mb-1.5">{ep.date}</p>
                <h3 className="text-sm font-semibold text-[#050505] leading-snug line-clamp-2 group-hover:text-[#57d996] transition-colors">
                  {ep.title}
                </h3>
              </button>
            ))}
          </div>

          {/* Divider + nav */}
          <div className="h-px bg-gray-200 mt-6 mb-5" />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#57d996] hover:text-[#57d996] transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next"
              className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#57d996] hover:text-[#57d996] transition-all active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Video lightbox modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveVideo(null); }}
        >
          <div className="relative w-full max-w-4xl">
            {/* Close button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <X size={18} /> Close
            </button>

            {/* Title */}
            <p className="text-white/70 text-sm mb-3 line-clamp-1">{activeVideo.title}</p>

            {/* Player */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "16/9" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
