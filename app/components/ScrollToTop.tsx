"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Instantly scroll to (0,0) regardless of scroll-behavior: smooth */
function hardScrollTop() {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  // Restore after a tick so smooth-scroll still works for user-initiated navigation
  requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
}

export default function ScrollToTop() {
  const pathname = usePathname();

  // On mount: disable browser scroll restoration so it never fights us
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (window.location.hash) return;

    // Immediate — covers most cases
    hardScrollTop();

    // Double-RAF: Next.js App Router restores scroll inside a single RAF.
    // Firing inside a second RAF guarantees we run after that restoration.
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => hardScrollTop());
    });

    // Belt-and-suspenders: also fight any late setTimeout-based restoration
    const t = setTimeout(() => hardScrollTop(), 80);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(t);
    };
  }, [pathname]);

  useEffect(() => {
    // bfcache (browser back/forward button)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !window.location.hash) hardScrollTop();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
