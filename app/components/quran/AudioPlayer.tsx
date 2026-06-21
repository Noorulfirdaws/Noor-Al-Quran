"use client";
import { Play, Pause, SkipBack, SkipForward, Repeat, X, Loader2, AlertCircle, Gauge, ChevronsDown } from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";
import { usePremium } from "../../context/PremiumContext";
import { getReciterById } from "../../services/audioService";

interface Props {
  surahNumber: number;
  totalAyahs: number;
}

export default function AudioPlayer({ surahNumber, totalAyahs }: Props) {
  const {
    isPlaying, isAudioLoading, audioError, playingAyah,
    playAyah, pauseAudio, resumeAudio, stopAudio, settings, updateSettings,
  } = useQuranReader();
  const { isFeatureAllowed } = usePremium();
  const reciter = getReciterById(settings.reciterId);

  // Show whenever a playback session is active (loading, playing, or paused on an ayah)
  if (!isAudioLoading && !isPlaying && playingAyah === null) return null;

  const currentAyah = playingAyah ?? 1;

  const handlePrev = () => { if (currentAyah > 1) playAyah(surahNumber, currentAyah - 1); };
  const handleNext = () => { if (currentAyah < totalAyahs) playAyah(surahNumber, currentAyah + 1); };
  const handlePlayPause = () => {
    if (isAudioLoading) return;
    if (isPlaying) pauseAudio();
    else resumeAudio();
  };

  const canRepeat = isFeatureAllowed("audio-repeat", surahNumber);
  const repeatActive = settings.repeatMode !== "off";

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(settings.playbackRate);
    updateSettings({ playbackRate: SPEEDS[(i + 1) % SPEEDS.length] });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1a12]/97 backdrop-blur-md border-t border-[#57d996]/15 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        {/* Status */}
        <div className="flex-1 min-w-0">
          {audioError ? (
            <div className="flex items-center gap-1.5 text-red-400 text-xs">
              <AlertCircle size={12} />
              <span className="truncate">{audioError}</span>
            </div>
          ) : (
            <>
              <div className="text-white/40 text-[10px] uppercase tracking-widest">
                {isAudioLoading ? "Loading…" : "Playing"}
              </div>
              <div className="text-white text-sm font-bold truncate">
                Ayah {currentAyah} · {reciter.name}
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentAyah <= 1 || isAudioLoading}
            className="text-white/40 hover:text-white disabled:opacity-20 transition-colors p-1"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={handlePlayPause}
            disabled={isAudioLoading}
            className="w-11 h-11 rounded-full bg-[#57d996] hover:bg-[#6ff2a8] text-black flex items-center justify-center transition-all active:scale-95 disabled:opacity-60"
          >
            {isAudioLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentAyah >= totalAyahs || isAudioLoading}
            className="text-white/40 hover:text-white disabled:opacity-20 transition-colors p-1"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Speed + follow + repeat + stop */}
        <div className="flex items-center gap-1.5">
          {/* Playback speed */}
          <button
            onClick={cycleSpeed}
            title="Playback speed"
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <Gauge size={14} />
            <span className="text-[10px] font-black tabular-nums">{settings.playbackRate}×</span>
          </button>

          {/* Auto-scroll follow */}
          <button
            onClick={() => updateSettings({ autoScroll: !settings.autoScroll })}
            title={settings.autoScroll ? "Auto-scroll: ON (follows recitation)" : "Auto-scroll: OFF"}
            className={`p-2 rounded-lg transition-all ${
              settings.autoScroll ? "bg-[#57d996]/20 text-[#57d996]" : "text-white/30 hover:text-white/60"
            }`}
          >
            <ChevronsDown size={15} />
          </button>

          <button
            disabled={!canRepeat}
            onClick={() =>
              canRepeat &&
              updateSettings({ repeatMode: settings.repeatMode === "off" ? "verse" : "off" })
            }
            title={canRepeat ? "Toggle repeat" : "Premium feature"}
            className={`p-2 rounded-lg transition-all ${
              repeatActive
                ? "bg-[#57d996]/20 text-[#57d996]"
                : canRepeat
                ? "text-white/30 hover:text-white/60"
                : "text-white/15 cursor-not-allowed"
            }`}
          >
            <Repeat size={15} />
            {repeatActive && (
              <span className="text-[9px] font-black block leading-none -mt-0.5">×{settings.repeatCount}</span>
            )}
          </button>

          <button
            onClick={stopAudio}
            className="text-white/30 hover:text-white/60 transition-colors p-1"
            title="Stop"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isAudioLoading ? "bg-white/30 animate-pulse" : "bg-[#57d996]"}`}
          style={{ width: `${(currentAyah / totalAyahs) * 100}%` }}
        />
      </div>
    </div>
  );
}
