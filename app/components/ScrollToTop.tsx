"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Instantly scroll to top AND wipe Next.js's stored scroll state. */
function hardScrollTop() {
  // 1. Disable smooth scroll so scrollTo is instant
  const html = document.documentElement;
  html.style.scrollBehavior = "auto";

  // 2. Zero out the scroll position Next.js App Router stores in history.state
  //    (__NA is the key Next.js uses: { x: number, y: number })
  try {
    const s = window.history.state ?? {};
    window.history.replaceState({ ...s, __NA: { x: 0, y: 0 } }, "");
  } catch { /* ignore SecurityError in sandboxed iframes */ }

  // 3. Scroll immediately
  window.scrollTo(0, 0);

  // 4. Restore smooth scroll after the frame so user-initiated scrolls still animate
  requestAnimationFrame(() => {
    html.style.scrollBehavior = "";
  });
}

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Tell the browser not to restore scroll on its own either
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    if (window.location.hash) return;

    hardScrollTop();

    // Next.js may still call window.scrollTo() from inside its own RAF.
    // A second RAF + a timeout cover both cases.
    let r1: number, r2: number;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => hardScrollTop());
    });
    const t1 = setTimeout(hardScrollTop, 50);
    const t2 = setTimeout(hardScrollTop, 150);

    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !window.location.hash) hardScrollTop();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
