"use client";
import { useEffect, useLayoutEffect } from "react";

export default function ScrollToTop() {
  // Fires before browser paint — prevents the flash of restored scroll position
  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    // bfcache restore (back/forward button)
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
