"use client";
import type { PatternKind } from "../data/products";

/** Faint Islamic geometric pattern overlay for the cover. */
function Pattern({ kind, accent }: { kind: PatternKind; accent: string }) {
  const id = `pat-${kind}-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.18]" aria-hidden>
      <defs>
        {kind === "geometric" && (
          <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="28" height="28" fill="none" />
            <path d="M14 0L28 14L14 28L0 14Z" fill="none" stroke={accent} strokeWidth="1" />
          </pattern>
        )}
        {kind === "arabesque" && (
          <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="11" fill="none" stroke={accent} strokeWidth="1" />
            <circle cx="0" cy="0" r="11" fill="none" stroke={accent} strokeWidth="1" />
            <circle cx="32" cy="32" r="11" fill="none" stroke={accent} strokeWidth="1" />
          </pattern>
        )}
        {kind === "stars" && (
          <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15 5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L15 18.6 9.8 21.1l1-5.8L6.5 11.2l5.9-.9z" fill="none" stroke={accent} strokeWidth="0.8" />
          </pattern>
        )}
        {kind === "calligraphy" && (
          <pattern id={id} width="40" height="24" patternUnits="userSpaceOnUse">
            <path d="M2 18 Q 12 2, 22 12 T 38 8" fill="none" stroke={accent} strokeWidth="1" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default function BookCover({
  title,
  arabicTitle,
  subtitle,
  gradient,
  accent,
  pattern,
  size = "md",
}: {
  title: string;
  arabicTitle?: string;
  subtitle?: string;
  gradient: string;
  accent: string;
  pattern: PatternKind;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm" ? "w-32 h-44 text-[11px]" :
    size === "lg" ? "w-56 h-80 text-base" :
    "w-40 h-56 text-xs";

  return (
    <div className="[perspective:1200px] group/book">
      <div
        className={`relative ${dims} rounded-r-md rounded-l-sm shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] transition-transform duration-500 [transform-style:preserve-3d] group-hover/book:[transform:rotateY(-18deg)] bg-gradient-to-br ${gradient}`}
      >
        {/* Spine */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[10px] rounded-l-sm"
          style={{ background: `linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.05))` }}
        />
        {/* Pattern overlay */}
        <Pattern kind={pattern} accent={accent} />

        {/* Gold frame */}
        <div className="absolute inset-2.5 rounded-sm border" style={{ borderColor: `${accent}66` }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-4 text-center">
          {/* Top ornament */}
          <div className="w-8 h-8 rounded-full border flex items-center justify-center mt-1" style={{ borderColor: `${accent}88` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: accent }} />
          </div>

          {/* Title block */}
          <div className="flex flex-col items-center gap-1">
            {arabicTitle && (
              <p className="leading-tight" style={{ color: accent, fontFamily: "var(--font-amiri), serif", fontSize: size === "lg" ? "1.4rem" : "1rem" }}>
                {arabicTitle}
              </p>
            )}
            <h3 className="text-white font-black leading-tight tracking-wide uppercase px-1">{title}</h3>
            {subtitle && <p className="text-white/55 text-[0.7em] leading-snug px-1">{subtitle}</p>}
          </div>

          {/* Bottom rule */}
          <div className="w-10 h-px mb-1" style={{ background: `${accent}aa` }} />
        </div>

        {/* Glossy highlight */}
        <div className="absolute inset-0 rounded-r-md bg-gradient-to-tr from-transparent via-white/0 to-white/10 pointer-events-none" />
      </div>
    </div>
  );
}
