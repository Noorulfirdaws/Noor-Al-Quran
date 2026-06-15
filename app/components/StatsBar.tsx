const stats = [
  { value: "114", label: "Surahs with AI check" },
  { value: "21", label: "Elite reciters" },
  { value: "Real-time", label: "Mistake detection" },
  { value: "6,236", label: "Ayahs tracked" },
  { value: "Free", label: "To start today" },
];

export default function StatsBar() {
  return (
    <div className="bg-[#050907] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between overflow-x-auto gap-0" style={{ scrollbarWidth: "none" }}>
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex-1 min-w-[100px] flex flex-col items-center py-5 border-r border-white/5 last:border-r-0"
            >
              <span className="text-white font-black text-xl sm:text-2xl tracking-tight">{s.value}</span>
              <span className="text-gray-500 text-xs mt-0.5 whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
