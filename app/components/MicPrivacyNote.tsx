import { ShieldCheck } from "lucide-react";

/**
 * Explicit microphone / audio-privacy disclosure. Required before launch since
 * the app records the user's voice. States plainly what happens to the audio:
 *  - Instant word-by-word feedback runs IN THE BROWSER (audio never leaves the device).
 *  - Deeper tajweed analysis sends the clip to our scoring service for processing
 *    only, over HTTPS, and it is not stored.
 */
export default function MicPrivacyNote({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 text-xs text-white/50 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 ${className}`}
    >
      <ShieldCheck size={15} className="text-[#57d996] flex-shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        <span className="text-white/75 font-semibold">Your voice stays private.</span>{" "}
        Instant recitation feedback runs entirely in your browser — the audio never leaves your
        device. Deeper tajweed analysis securely sends the clip to our scoring service for
        processing only, over an encrypted connection, and it is never stored.
      </p>
    </div>
  );
}
