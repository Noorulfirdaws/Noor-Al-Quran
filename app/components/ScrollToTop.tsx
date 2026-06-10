"use client";
import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Don't override hash anchors (e.g. /#pricing, /#features)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const onPageHide = () => {
      if (!window.location.hash) window.scrollTo(0, 0);
    };
    window.addEventListener("pagehide", onPageHide);

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !window.location.hash) window.scrollTo(0, 0);
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
