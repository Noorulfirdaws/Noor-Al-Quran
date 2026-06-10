"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip if navigating to an anchor link
    if (window.location.hash) return;

    // Immediate scroll — fires before paint on client navigation
    window.scrollTo(0, 0);

    // Second pass one frame later: Next.js App Router restores the previous
    // scroll position after React renders. requestAnimationFrame runs after
    // that restoration, overriding it cleanly without a visible flash.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, [pathname]); // re-run on every route change, not just initial mount

  useEffect(() => {
    // bfcache restore via browser back/forward buttons
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !window.location.hash) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
